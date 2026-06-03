const axios = require('axios');
const db = require('../../control-plane/src/db/index');
const { reportResult } = require('./reporter');

const sendRequest = async(req, res)=>{

    res.status(200).json({ message: "Probe instruction received" });

    try {
        const agentDetails = await db.query('select * from agents');
        const agentOneId = agentDetails.rows[0].id;
    
        const {monitorId, url} = req.body;

        if (!url || !monitorId) {
            console.error("Missing parameters!");
            return; 
        } 
        
        const startTime = Date.now();
        
        try {
            const response = await axios.get(url, { timeout: 10000 });
            
            const postRequest = {
                monitorId : monitorId,
                agentId : agentOneId,
                statusCode : response.status,
                responseTime : Date.now() - startTime,
                success : response.status === 200
            };

            reportResult(postRequest);

        } catch (error) {
            console.warn(`Request to ${url} failed:`, error.message);
            
            const postRequest = {
                monitorId : monitorId,
                agentId : agentOneId,
                statusCode : null,
                responseTime : null,
                success : false
            };

            reportResult(postRequest);
        }
        
    } catch (error) {
        console.error("Agent DB or setup error:", error.message);
    }
}

module.exports = {sendRequest}