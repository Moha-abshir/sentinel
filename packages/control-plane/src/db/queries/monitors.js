/*
creating a monitor
deleting a monitor
editing a monitor
*/

//1. creating a monitor
const db = require('../index.js');

const createMonitor = async(req, res)=>{
    const {monitorName, url, interval} = req.body;
    try {
        if (!monitorName || !url || !interval) {
            throw new Error("Make sure the parameters are all inserted!");
        } else {
            await db.query(`
                INSERT INTO monitors (name, url, interval)
                values($1, $2, $3);
            `,[monitorName, url, interval]);
            res.status(201).json({message: 'Monitor successfully created'})
        }
    } catch (error) {
        console.log("Error", error.message);
        res.status(400).json({error: error.message});
    }
};
module.exports = {
   createMonitor
};