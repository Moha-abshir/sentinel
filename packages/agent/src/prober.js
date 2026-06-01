const axios = require('axios');

const sendRequest = async(req, res)=>{
    try {
        const {url, interval} = req.body;
        if (!url || ! interval) {
            throw new Error("Provide all the parameters")
        } else {
            const response = await axios.get(url);
            const data = response.status;
            console.log(data);
        }
    } catch (error) {
        console.log("Agent One Error: ", error.message)
    }
}
module.exports = {sendRequest}