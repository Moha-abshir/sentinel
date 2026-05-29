const fs = require('fs');
const path = require ('path');
const {Client} = require('pg');
require('dotenv').config({path: '../.env'});

const initdb = async ()=>{
    const client = new Client();

    try {
        await client.connect();
        
        const createAgentSql = path.join(__dirname, 'create_agents.sql');
        const createAgentQuerry = fs.readFileSync(createAgentSql, 'utf8');

        await client.query(createAgentQuerry);
        console.log("Success");
    } catch (error) {
        console.log('Error: ', error.message);
    }finally{
        client.end();
        console.log('Connection ended');
    };
}
initdb();