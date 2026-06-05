const express = require('express');
const router = express.Router();
const db = require('../db/index');
const {createMonitor} = require('../db/queries/monitors');

router.post('/create', createMonitor);

router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM monitors ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM monitors WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;