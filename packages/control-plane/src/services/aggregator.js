const db = require('../db/index');
const { saveResult } = require('../db/queries/results');
const { broadcast } = require('../websocket/index');
const { sendEmail } = require('../notification/email');

const updateMonitorStatus = async (monitorId, newStatus, currentStatus, monitorData) => {
    if (newStatus !== currentStatus) {
        // State changed! Update DB.
        await db.query(`
            UPDATE monitors 
            SET status = $1, updated_at = NOW() 
            WHERE id = $2
        `, [newStatus, monitorId]);
        
        console.log(`[Aggregator] Monitor ${monitorData.name} changed from ${currentStatus} to ${newStatus}`);

        // Broadcast the status change
        broadcast({
            type: 'STATUS_CHANGED',
            monitorId,
            newStatus,
            previousStatus: currentStatus,
            name: monitorData.name,
            timestamp: new Date()
        });

        // Send Email Alert
        try {
            // Find the admin user to email (just grabbing the first user for now)
            const adminUser = await db.query(`SELECT email FROM users LIMIT 1`);
            if (adminUser.rows.length > 0) {
                const adminEmail = adminUser.rows[0].email;
                const subject = newStatus === 'offline' 
                    ? `🚨 ALERT: ${monitorData.name} is DOWN` 
                    : `✅ RECOVERED: ${monitorData.name} is UP`;
                
                const text = `Monitor ${monitorData.name} (${monitorData.url}) changed from ${currentStatus} to ${newStatus}.`;
                
                await sendEmail({ to: adminEmail, subject, text, html: `<b>${text}</b>` });
                console.log(`[Aggregator] Alert email dispatched to ${adminEmail}`);
            }
        } catch (error) {
            console.error("[Aggregator] Failed to send alert email:", error.message);
        }
    }
};

const evaluateStatus = async (monitorId) => {
    // 1. Get current state of the monitor
    const monitorResult = await db.query(`SELECT * FROM monitors WHERE id = $1`, [monitorId]);
    if (monitorResult.rows.length === 0) return;
    const monitorData = monitorResult.rows[0];

    // 2. Get the latest probe result
    const result = await db.query(`
        SELECT * 
        FROM probe_results 
        WHERE monitor_id = $1 
        ORDER BY checked_at DESC 
        LIMIT 1
    `, [monitorId]);

    if (result.rows.length === 0) return;

    const latestResult = result.rows[0];
    const newStatus = latestResult.success ? 'online' : 'offline';
    
    // 3. Update status and alert if changed
    await updateMonitorStatus(monitorId, newStatus, monitorData.status, monitorData);

    // 4. Broadcast the raw result for real-time latency charts
    broadcast({
        type: 'NEW_RESULT',
        monitorId,
        result: latestResult
    });
};

const receiveResult = async (resultData) => {
    try {
        await saveResult(resultData);
        await evaluateStatus(resultData.monitorId);
    } catch (error) {
        console.error("[Aggregator] Error processing result:", error.message);
    }
};

module.exports = { receiveResult };
