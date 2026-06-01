const db = require('../db/index');
const axios = require('axios');
const runCycle = async ()=>{
    try {
        const result = await db.query("select * from monitors");
        const url = 'http://localhost:3001/api/agentOne/';
        const payload = {
            url : result.rows[0].url,
            interval : result.rows[0].interval
        }

        await axios.post(url, payload);
        console.log(url);
        console.log(interval);
    } catch (error) {
        console.log("Error: ", error.message);   
    }
}
const start =  ()=>{
    try {
        runCycle();
        console.log("Scheduler is up and running");
        setInterval(()=>{
            try {
                runCycle();
            } catch (error) {
                console.log("Error:", error.message);
            }
        }, 1000000);
    } catch (error) {
        console.log("Error: ", error.message);
    }
}
module.exports = {start}