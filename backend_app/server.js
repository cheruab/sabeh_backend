// server.js - Root file for Railway deployment
const { spawn } = require('child_process');

console.log('🚀 Starting all microservices...');

// Only start internal services if needed
const services = [
  { name: 'Customer', path: './customer/src/index.js', port: 8001 },
  { name: 'Product', path: './products/src/index.js', port: 8002 },
  { name: 'Shopping', path: './shopping/src/index.js', port: 8003 },
  { name: 'Group', path: './group/src/index.js', port: 8004 },
];

// Spawn internal services
services.forEach(service => {
  // Skip services if you want Railway to only run Gateway
  const child = spawn('node', [service.path], {
    stdio: 'inherit',
    env: { ...process.env },
  });

  child.on('error', err => {
    console.error(`❌ Error starting ${service.name} service:`, err);
  });

  console.log(`✅ ${service.name} service started on port ${service.port}`);
});

// Start gateway on Railway's assigned port
setTimeout(() => {
  console.log('🌐 Starting Gateway...');
  
  const PORT = process.env.PORT || 8000; // Railway sets this automatically
  const gateway = spawn('node', ['./gateway/index.js'], {
    stdio: 'inherit',
    env: { ...process.env, PORT }, // Inject PORT into gateway
  });

  gateway.on('error', err => {
    console.error('❌ Error starting Gateway:', err);
  });

  console.log(`✅ Gateway started on port ${PORT}`);
}, 3000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down all services...');
  process.exit();
});
