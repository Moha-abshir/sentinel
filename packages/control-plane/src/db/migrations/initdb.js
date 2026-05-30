const fs = require('fs');
const path = require('path');
const db = require('../index.js');

const createTables = async()=>{
    try {
        //Executing 002_create_monitors.sql
       const monitorFile = path.join(__dirname, '002_create_monitors.sql');
       const monitorSql = fs.readFileSync(monitorFile, 'utf-8');
       await db.query(monitorSql);
       
       //Executing 003_create_agents.sql
       const agentsFile = path.join(__dirname, '003_create_agents.sql');
       const agentsSql = fs.readFileSync(agentsFile, 'utf-8');
       await db.query(agentsSql);

       //Executing 004_create_report.sql
       const resultFile = path.join(__dirname, '004_create_report.sql');
       const resultSql = fs.readFileSync(resultFile, 'utf-8');
       await db.query(resultSql);

       console.log("Table creation finished");
    } catch (error) {
        console.log("Error: ", error.message);
    }
};
createTables();