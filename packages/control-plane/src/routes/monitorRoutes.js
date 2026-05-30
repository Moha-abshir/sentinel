const express = require('express');
const router = express.Router();
const {createMonitor} = require('../db/queries/monitors');

router.post('/create', createMonitor);

module.exports = router;