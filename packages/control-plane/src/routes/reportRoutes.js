const express = require('express');
const router = express.Router();
const aggregator = require('../services/aggregator');

router.post('/', async (req, res) => {
    try {
        const { monitorId, agentId, statusCode, responseTime, success } = req.body;
        
        if (!monitorId || !agentId) {
            return res.status(400).json({ error: "Missing required fields: monitorId or agentId" });
        }

        // Hand off entirely to the aggregator!
        await aggregator.receiveResult({ monitorId, agentId, statusCode, responseTime, success });

        res.status(201).json({ message: "Report handed off to aggregator" });
    } catch (error) {
        console.error("Error receiving report:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
