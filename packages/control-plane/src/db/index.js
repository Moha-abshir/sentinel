const {Pool} = require('pg');
const path = require('path');
require('dotenv').config({path: path.join(__dirname,'.env')});

const pool = new Pool({
    //maximum number of connection
    max: 20,
    //How long a client is allowed to remain idle before being closed
    idleTimeoutMillis : 2000,
    //how long to wait for a connection to be estblished before throwing and error
    connectionTimeoutMillis : 20000,
});
module.exports = {
    query: (text, params) => pool.query(text, params),
    pool:pool
}