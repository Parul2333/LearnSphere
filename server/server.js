import express from "express";
import dotenv from "dotenv";
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { Server as socketio } from "socket.io"; 

import connectDB from "./config/db.js";
import redis from "./config/redis.js"; 
import mongoose from "mongoose";

import quoteRoutes from './routes/quoteRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; 
import contentRoutes from "./routes/contentRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { incrementAccessCounter } from "./controllers/siteController.js";
import { setupNotificationEvents } from "./events/notificationEvents.js";

import { setSocketIO } from "./utils/socket.js";

dotenv.config({ path: "../.env" });
// Only connect to the real database if we are NOT in test mode
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let httpsServer;
let httpServer;
let io;

const initializeSocketIO = (httpServer) => {
  // Allow both HTTP and HTTPS frontend URLs for WebSocket connections
  const allowedOrigins = [
    'http://localhost:5173',
    process.env.CLIENT_URL_ONLY,
    'http://localhost:3000',
    'https://localhost:3000',
    // 'http://34.224.60.209:5000',
    // 'https://34.224.60.209:5000',
    process.env.CLIENT_URL
  ].filter(Boolean);
  
    const socketIO = new socketio(httpServer, { 
    cors: { 
      origin: function (origin, callback) {
        // Allow requests with no origin, any localhost origin, or from configured allowed origins
        if (!origin || origin.includes('localhost') || allowedOrigins.includes('*') || allowedOrigins.some(allowed => allowed && origin.startsWith(allowed))) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'], // Support both transports
    allowEIO3: true // Backward compatibility
  });
  
  // Setup notification event handlers (removed duplicate connection handler)
  setupNotificationEvents(socketIO);
  
  // Global connection logging
  socketIO.on("connection", (socket) => {
    console.log(`🔗 Socket.io client connected: ${socket.id}`);
  });
  
  return socketIO;
};

app.use(incrementAccessCounter);

// Configure CORS to allow both HTTP and HTTPS frontend URLs
const allowedOrigins = [
    'http://localhost:5173',
    'https://localhost:5173',
    'http://localhost:3000',
    'https://localhost:3000',
    // 'http://34.224.60.209:5000',
    // 'https://34.224.60.209:5000',
    process.env.CLIENT_URL
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      // Allow any localhost origin (any port)
      if (origin?.includes && origin.includes('localhost')) {
        return callback(null, true);
      }

      // Allow explicit origins or wildcard
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const clientDist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(clientDist, "index.html")));
} else {
  app.get("/", (req, res) => res.send("API running..."));
}

app.get("/api/health", (req, res) => res.json({ mongodb: mongoose.connection?.readyState, redis: redis?.status }));

// --- API ROUTES ---
app.use("/api/auth", userRoutes); 
app.use("/api/admin", adminRoutes); 
app.use("/api/content", contentRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/admin/analytics", analyticsRoutes);
app.use("/api/contact", contactRoutes); // ✅ Added Contact Route
app.use('/api/quotes', quoteRoutes);

const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 4430;

if (process.env.NODE_ENV !== "test") { 
    // Always start HTTP server
    httpServer = http.createServer(app);
    io = initializeSocketIO(httpServer);
    setSocketIO(io); // Make io instance available to controllers
    httpServer.listen(PORT,"0.0.0.0", () => {
        console.log(`\n✅ HTTP Server: http://localhost:${PORT}`);
        console.log(`✅ WebSocket Server: ws://localhost:${PORT}`);
    });

    // Also start HTTPS server if certificates exist (for REST API calls)
    const certDir = path.join(__dirname, "certs");
    const keyPath = path.join(certDir, "key.pem");
    const certPath = path.join(certDir, "cert.pem");

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        try {
            const key = fs.readFileSync(keyPath);
            const cert = fs.readFileSync(certPath);
            httpsServer = https.createServer({ key, cert }, app);
            // Attach Socket.io to HTTPS server as well for wss:// connections
            const httpsIO = initializeSocketIO(httpsServer);
            // Keep using the HTTP io instance as primary, but HTTPS can also handle connections
            httpsServer.listen(HTTPS_PORT, () => {
                console.log(`✅ HTTPS Server: https://localhost:${HTTPS_PORT}`);
                console.log(`✅ WebSocket Server: wss://localhost:${HTTPS_PORT}`);
            });
        } catch (e) {
            console.warn("HTTPS server failed to start:", e?.message);
            console.log("⚠️  Continuing with HTTP server only");
        }
    } else {
        console.log("⚠️  SSL certificates not found - running HTTP server only");
    }
}

// Export io instance for use in controllers
export { app, io, httpsServer, httpServer };