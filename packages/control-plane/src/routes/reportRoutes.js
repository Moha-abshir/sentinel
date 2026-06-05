const express = require('express');
const router = express.Router();
const db = require('../db/index');
const {handleReport} = require('../db/queries/report');

router.post('/', handleReport);

router.get('/:monitorId', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT * FROM probe_results 
            WHERE monitor_id = $1 AND checked_at >= NOW() - INTERVAL '24 hours'
            ORDER BY checked_at ASC
        `, [req.params.monitorId]);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
