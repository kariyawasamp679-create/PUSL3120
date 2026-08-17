import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './socket.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
await connectDB();

// Create HTTP server instance
const server = http.createServer(app);

// Initialize Socket.io WebSockets
initSocket(server);

server.listen(PORT, () => {
  console.log(`[Server] MediPulse 360 API and WebSockets running on port ${PORT}`);
  console.log(`[Server] Health Check: http://localhost:${PORT}/api/health`);
});

