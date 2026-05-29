const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'control-plane' });
});
app.get('/', (req, res)=>{
  res.send("Backend server running");
})

// Start the server
app.listen(port, () => {
  console.log(`Control-plane server is running on port ${port}`);
});
