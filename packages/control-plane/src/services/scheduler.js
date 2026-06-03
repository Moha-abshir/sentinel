const db = require('../db/index');
const axios = require('axios');

const getDueMonitors = async () => {
    const query = `
        SELECT * FROM monitors
        WHERE status != 'paused' AND (
            last_checked_at IS NULL 
            OR EXTRACT(EPOCH FROM (NOW() - last_checked_at)) >= interval
        )
    `;
    const result = await db.query(query);
    return result.rows;
};

const dispatchProbe = async (monitor) => {
    try {
        const url = 'http://localhost:3001/api/agentOne/';
        const payload = {
            monitorId: monitor.id,
            url: monitor.url
        };
        await axios.post(url, payload);
        console.log(`Dispatched probe for monitor: ${monitor.name}`);
        return true;
    } catch (error) {
        console.error(`Failed to dispatch probe for monitor ${monitor.name}:`, error.message);
        return false;
    }
};

const updateLastChecked = async (monitorId) => {
    await db.query(`UPDATE monitors SET last_checked_at = NOW() WHERE id = $1`, [monitorId]);
};

const runCycle = async () => {
    try {
        const dueMonitors = await getDueMonitors();
        if (dueMonitors.length > 0) {
            console.log(`[Scheduler] Found ${dueMonitors.length} monitors due for checking.`);
        }
        for (const monitor of dueMonitors) {
            const dispatched = await dispatchProbe(monitor);
            if (dispatched) {
                await updateLastChecked(monitor.id);
            }
        }
    } catch (error) {
        console.error("Scheduler Cycle Error: ", error.message);
    }
};

const start = () => {
    console.log("Scheduler engine is up and running...");
    runCycle();
    
    // Heartbeat runs every 10 seconds
    setInterval(() => {
        runCycle();
    }, 10000);
};

module.exports = { start };