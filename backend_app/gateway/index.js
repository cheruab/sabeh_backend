const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Use Railway's PORT environment variable
const PORT = process.env.PORT || 8000;

app.use('/customer', proxy('http://localhost:8001'));
app.use('/product', proxy('http://localhost:8002')); 
app.use('/shopping', proxy('http://localhost:8003'));
app.use('/group', proxy('http://localhost:8004'));

// ✅ Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok',
        message: 'Sabeh Backend API Gateway',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

app.listen(PORT, () => {
    console.log(`🚀 Gateway is Listening to Port ${PORT}`);
}).on('error', (err) => {
    console.error('Gateway Error:', err);
    process.exit(1);
});