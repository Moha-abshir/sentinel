const {Client} = require('pg');
require('dotenv').config();
const connection = new Client();

async function testConnection(){
    try {
        await connection.connect();
        console.log('Database successfully connected');

    } catch (error) {
        console.log('Error connecting:', error.message);
    } finally{
        await connection.end();
        console.log('Connection ended');
    }
}
testConnection();