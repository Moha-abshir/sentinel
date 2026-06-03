const express = require('express');
const router = express.Router();
const db = require('../db/index');

router.post('/', async (req, res) => {
    try {
        const { monitorId, agentId, statusCode, responseTime, success } = req.body;
        
        if (!monitorId || !agentId) {
            return res.status(400).json({ error: "Missing required fields: monitorId or agentId" });
        }

        await db.query(`
            INSERT INTO probe_results (monitor_id, agent_id, status_code, response_time, success)
            VALUES ($1, $2, $3, $4, $5)
        `, [monitorId, agentId, statusCode, responseTime, success]);

        // Note: The Aggregator logic to update monitor status (online/offline/degraded) 
        // based on these results will be wired up here in the next phase!

        res.status(201).json({ message: "Report successfully saved to probe_results" });
    } catch (error) {
        console.error("Error saving report to DB:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
