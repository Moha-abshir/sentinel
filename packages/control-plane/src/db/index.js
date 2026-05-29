const {Client} = require('pg');
require('dotenv').config();
const connection = new Client();

async function testConnection(){
    try {
        await connection.connect();

        const result = connection.query('select now() as current_time');
        console.log(result.row[0].current_time);
        console.log('Database successfully connected');
    } catch (error) {
        console.log('Error connecting:', error.message);
    } finally{
        await connection.end();
        console.log('Connection ended');
    }
}
testConnection();