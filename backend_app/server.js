// server.js - Root file that starts all services
const { spawn } = require('child_process');

console.log('🚀 Starting all microservices...');

// Start all services as child processes
const services = [
  { name: 'Customer', path: './customer/src/index.js', port: 8001 },
  { name: 'Product', path: './products/src/index.js', port: 8002 },
  { name: 'Shopping', path: './shopping/src/index.js', port: 8003 },
  { name: 'Group', path: './group/src/index.js', port: 8004 },
];

// Start each service
services.forEach(service => {
  const process = spawn('node', [service.path], {
    stdio: 'inherit',
    env: { ...process.env }
  });

  process.on('error', (err) => {
    console.error(`❌ Error starting ${service.name} service:`, err);
  });

  console.log(`✅ ${service.name} service started on port ${service.port}`);
});

// Start gateway last (after a small delay to ensure services are up)
setTimeout(() => {
  console.log('🌐 Starting Gateway...');
  const gateway = spawn('node', ['./gateway/index.js'], {
    stdio: 'inherit',
    env: { ...process.env }
  });

  gateway.on('error', (err) => {
    console.error('❌ Error starting Gateway:', err);
  });

  console.log('✅ Gateway started on port 8000');
}, 3000); // Wait 3 seconds for services to start

// Keep the process alive
process.on('SIGINT', () => {
  console.log('🛑 Shutting down all services...');
  process.exit();
});