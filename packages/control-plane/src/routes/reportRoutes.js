const express = require('express');
const router = express.Router();
const {handleReport} = require('../db/queries/report');


router.post('/', handleReport);

module.exports = router;
