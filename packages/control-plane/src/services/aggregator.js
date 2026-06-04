const db = require('../db/index');
const { saveResult } = require('../db/queries/results');

const updateMonitorStatus = async (monitorId, status) => {
    await db.query(`
        UPDATE monitors 
        SET status = $1, updated_at = NOW() 
        WHERE id = $2
    `, [status, monitorId]);
    console.log(`[Aggregator] Monitor ${monitorId} status updated to: ${status}`);
};

const evaluateStatus = async (monitorId) => {
    // In Phase 1, just get the absolute latest result for this monitor
    const result = await db.query(`
        SELECT success 
        FROM probe_results 
        WHERE monitor_id = $1 
        ORDER BY checked_at DESC 
        LIMIT 1
    `, [monitorId]);

    if (result.rows.length === 0) return;

    const isSuccess = result.rows[0].success;
    const newStatus = isSuccess ? 'online' : 'offline';
    
    await updateMonitorStatus(monitorId, newStatus);
};

const receiveResult = async (resultData) => {
    try {
        console.log(`[Aggregator] Received report for Monitor ${resultData.monitorId}. Processing...`);
        
        await saveResult(resultData);
        
        await evaluateStatus(resultData.monitorId);
        
    } catch (error) {
        console.error("[Aggregator] Error processing result:", error.message);
    }
};

module.exports = { receiveResult };
