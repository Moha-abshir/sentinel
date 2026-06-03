const axios = require('axios');

const reportResult = async (pingData) => {
    try {
        const controlPlaneUrl = 'http://localhost:3000/api/reports';
        const response = await axios.post(controlPlaneUrl, pingData);
        
        if (response.status === 201 || response.status === 200) {
            console.log("result delivered successfully");
        }
    } catch (error) {
        console.error("failed to deliver result:", error.message);
    }
};

module.exports = { reportResult };