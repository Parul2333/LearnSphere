import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import { Server as socketio } from 'socket.io'; 

// --- Configuration Imports ---
import connectDB from './config/db.js';
import redis from './config/redis.js'; 

// --- Route Imports (ESM) ---
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js'; 
import contentRoutes from './routes/contentRoutes.js'; 
// 💡 NEW IMPORT: Website Access Counter Middleware
import { incrementAccessCounter } from './controllers/siteController.js'; 

// Load environment variables
dotenv.config({ path: '../.env' });

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// --- Initialize Socket.io ---
const io = new socketio(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('🔗 New Socket.io connection established');
  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
});
// --- End Socket.io Setup ---

// 💡 NEW MIDDLEWARE: Apply counter middleware to all incoming public requests
app.use(incrementAccessCounter); 

// Middleware
app.use(cors());
app.use(express.json()); // Body parser

// Simple Test Route
app.get('/', (req, res) => {
  res.send('API is running for LearnSphere...');
});

// --- Define Routes ---
// 1. Authentication and User Profiles
app.use('/api/auth', userRoutes); 

// 2. Admin Content Management (Creating Subjects/Notes/Videos)
app.use('/api/admin', adminRoutes); 

// 3. Public/User Content Retrieval (Includes content/subjects and /content/branches)
app.use('/api/content', contentRoutes); 

// --- Error Handling Middleware (optional) ---
// app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// CRITICAL FIX: Prevent server from starting to listen during Jest tests
if (process.env.NODE_ENV !== 'test') { 
    server.listen(PORT, () => {
        console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

// Export the app instance for Supertest
export default app;