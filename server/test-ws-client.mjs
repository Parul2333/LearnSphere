import { io } from 'socket.io-client';

const host = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 4430;
const protocol = process.env.PROTOCOL || 'https';
const url = `${protocol}://${host}:${port}`;

console.log('Test client connecting to', url);

const socket = io(url, {
  transports: ['websocket'], // force websocket for this test
  timeout: 20000,
  reconnection: false,
  secure: url.startsWith('https'),
  rejectUnauthorized: false,
  // Simulate browser Origin header so server CORS/socket origin checks see a browser-like request
  extraHeaders: {
    Origin: `https://localhost:${process.env.HTTPS_PORT || 4430}`,
  },
});

socket.on('connect', () => {
  console.log('Connected, id=', socket.id);
  socket.emit('test_message', { msg: 'hello from test client' });
  setTimeout(() => socket.close(), 2000);
});

socket.on('connect_error', (err) => {
  console.error('connect_error:', err && err.message ? err.message : err);
});

socket.on('error', (e) => {
  console.error('error:', e);
});

socket.on('disconnect', (reason) => {
  console.log('disconnected:', reason);
  process.exit(0);
});

// Keep process alive for a short time in case events take a while
setTimeout(() => {
  console.log('Exiting after timeout');
  process.exit(0);
}, 30000);
