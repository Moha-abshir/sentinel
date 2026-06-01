const axios = require('axios');

const sendRequest = async(req, res)=>{
    try {
        const {url, interval} = req.body;
        console.log( url, ' ', interval);
    } catch (error) {
        console.log("Agent One Error: ", error.message)
    }
}
module.exports = {sendRequest}