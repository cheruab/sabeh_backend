const express = require('express');
const cors = require('cors');
const { customer, appEvent } = require('./api');

module.exports = async (app, channel) => {
  // ✅ Enhanced CORS configuration
  app.use(cors({
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200
  }));

  // ✅ Body parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(express.static(__dirname + '/public'));

  // ✅ Request logger for debugging
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
      headers: {
        'content-type': req.headers['content-type'],
        origin: req.headers.origin,
      }
    });
    next();
  });

  // ✅ Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'customer-service'
    });
  });

  // ✅ Root endpoint
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Customer Service API',
      version: '1.0.0',
      endpoints: ['/customer', '/health']
    });
  });

  // Listen to events
  // appEvent(app);

  // API routes
  customer(app, channel);

  // ✅ 404 handler
  app.use((req, res, next) => {
    console.log(`❌ 404: ${req.method} ${req.path}`);
    res.status(404).json({ 
      error: 'Route not found',
      path: req.path,
      method: req.method
    });
  });

  // ✅ Error handler
  app.use((err, req, res, next) => {
    console.error('💥 Error:', err);
    res.status(err.status || 500).json({ 
      error: err.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });
};