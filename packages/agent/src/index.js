const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const {sendRequest} = require('./prober');
dotenv.config();

const app = express();
const port = process.env.port || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res)=>{
    res.send("Agent one running");
})

app.use('/api/agentOne/', sendRequest);

app.listen(port, ()=>{
    console.log(`Agent running on port ${port}`);
})