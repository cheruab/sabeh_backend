const { spawn } = require('child_process');

console.log('🚀 Starting all microservices...');

const services = [
  { name: 'Customer', path: './customer/src/index.js', port: 8001 },
  { name: 'Product', path: './products/src/index.js', port: 8002 },
  { name: 'Shopping', path: './shopping/src/index.js', port: 8003 },
  { name: 'Group', path: './group/src/index.js', port: 8004 },
];

const processes = [];

// Start each service
services.forEach(service => {
  const childProcess = spawn('node', [service.path], {
    stdio: 'inherit',
    env: process.env
  });

  childProcess.on('error', (err) => {
    console.error(`❌ Error starting ${service.name}:`, err);
  });

  processes.push(childProcess);
  console.log(`✅ ${service.name} service started on port ${service.port}`);
});

// ✅ INCREASED to 10 seconds for Railway's slower startup
setTimeout(() => {
  console.log('🌐 Starting Gateway...');
  
  const gateway = spawn('node', ['./gateway/index.js'], {
    stdio: 'inherit',
    env: process.env
  });

  gateway.on('error', (err) => {
    console.error('❌ Gateway error:', err);
    process.exit(1);
  });

  processes.push(gateway);
  
}, 10000);  // ← 10 seconds

// Cleanup on exit
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down all services...');
  processes.forEach(p => p.kill());
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down all services...');
  processes.forEach(p => p.kill());
  process.exit(0);
});