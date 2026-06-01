const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db/index');
const monitorRoutes = require('./routes/monitorRoutes');
const {start} = require('../src/services/scheduler');
process.on('SIGINT', ()=>{
  console.log("Shutting down the pool");
  try {
    db.pool.end();
    console.log("Pool disconnected");
    process.exit(0);
  } catch (error) {
    console.log("Error Shutting down the pool", error.message);
    process.exit(1);
  }
})

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

//start the scheduler to fire probes as long as the server is up.
start();

app.get('/', (req, res)=>{
  res.send("Backend server running");
});

app.get('/api/monitor/create', (req, res)=>{
  res.send("Testing")
})

app.use('/api/monitor/', monitorRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Control-plane server is running on port ${port}`);
});
