const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();

// ✅ CRITICAL: Use Railway's PORT environment variable
const PORT = process.env.PORT || 8000;

console.log('🔧 PORT from environment:', process.env.PORT);
console.log('🎯 Gateway will listen on port:', PORT);

// Middleware
app.use(cors());
app.use(express.json());

// Health check - MUST respond quickly
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok',
        message: 'Sabeh Backend API Gateway',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        services: {
            customer: 'http://localhost:8001',
            product: 'http://localhost:8002',
            shopping: 'http://localhost:8003',
            group: 'http://localhost:8004'
        }
    });
});

// Proxy routes
app.use('/customer', proxy('http://localhost:8001'));
app.use('/product', proxy('http://localhost:8002')); 
app.use('/shopping', proxy('http://localhost:8003'));
app.use('/group', proxy('http://localhost:8004'));

// Start server on Railway's PORT
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Gateway is Listening to Port ${PORT}`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
}).on('error', (err) => {
    console.error('❌ Gateway Error:', err);
    process.exit(1);
});