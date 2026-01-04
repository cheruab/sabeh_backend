const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();

// ✅ Railway provides this
const PORT = process.env.PORT || 8000;

console.log('🔧 PORT from environment:', process.env.PORT);
console.log('🎯 Gateway will listen on port:', PORT);

// Middleware
app.use(cors());
app.use(express.json());

// Health check
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

// Proxy routes with error handling
app.use('/customer', proxy('http://localhost:8001', {
    proxyReqPathResolver: (req) => {
        return req.url;
    }
}));

app.use('/product', proxy('http://localhost:8002', {
    proxyReqPathResolver: (req) => {
        return req.url;
    }
})); 

app.use('/shopping', proxy('http://localhost:8003', {
    proxyReqPathResolver: (req) => {
        return req.url;
    }
}));

app.use('/group', proxy('http://localhost:8004', {
    proxyReqPathResolver: (req) => {
        return req.url;
    }
}));

// ✅ CRITICAL: Listen on 0.0.0.0, not localhost!
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Gateway READY on 0.0.0.0:${PORT}`);
    console.log(`🌍 Public URL: https://sabehbackend-production.up.railway.app`);
}).on('error', (err) => {
    console.error('❌ Gateway failed to start:', err);
    process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    process.exit(0);
});