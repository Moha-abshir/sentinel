const db = require('../index');

async function saveResult({ monitorId, agentId, statusCode, responseTime, success }) {
    await db.query(`
        INSERT INTO probe_results (monitor_id, agent_id, status_code, response_time, success)
        VALUES ($1, $2, $3, $4, $5)
    `, [monitorId, agentId, statusCode, responseTime, success]);
}

module.exports = { saveResult };