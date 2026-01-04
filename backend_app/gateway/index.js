const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ 
    msg: 'Gateway is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Proxy to microservices
app.use('/customer', proxy('http://localhost:8001'));
app.use('/product', proxy('http://localhost:8002')); 
app.use('/shopping', proxy('http://localhost:8003'));
app.use('/group', proxy('http://localhost:8004'));

// ✅ USE RAILWAY'S PORT (critical fix!)
const PORT = process.env.PORT || 8000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Gateway running on port ${PORT}`);
}).on('error', (err) => {
  console.error('❌ Gateway failed to start:', err);
  process.exit(1);
});