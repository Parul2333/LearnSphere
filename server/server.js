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

import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; 
import contentRoutes from "./routes/contentRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { incrementAccessCounter } from "./controllers/siteController.js";
import { setupNotificationEvents } from "./events/notificationEvents.js";

dotenv.config({ path: "../.env" });
connectDB();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let server, io;

const initializeSocketIO = (httpServer) => {
  const socketIO = new socketio(httpServer, { cors: { origin: "*", methods: ["GET", "POST"] } });
  socketIO.on("connection", (socket) => {
    console.log(" Socket.io connection");
    socket.on("disconnect", () => console.log("Socket disconnected"));
  });
  setupNotificationEvents(socketIO);
  return socketIO;
};

app.use(incrementAccessCounter);
app.use(cors());
app.use(express.json());

const clientDist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(clientDist, "index.html")));
} else {
  app.get("/", (req, res) => res.send("API running..."));
}

app.get("/api/health", (req, res) => res.json({ mongodb: mongoose.connection?.readyState, redis: redis?.status }));

app.use("/api/auth", userRoutes); 
app.use("/api/admin", adminRoutes); 
app.use("/api/content", contentRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/admin/analytics", analyticsRoutes);

const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 4430;

if (process.env.NODE_ENV !== "test") { 
    const certDir = path.join(__dirname, "certs");
    const keyPath = path.join(certDir, "key.pem");
    const certPath = path.join(certDir, "cert.pem");

    try {
        if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
            const key = fs.readFileSync(keyPath);
            const cert = fs.readFileSync(certPath);
            server = https.createServer({ key, cert }, app);
            io = initializeSocketIO(server);
            server.listen(HTTPS_PORT, () => console.log(`\n HTTPS: https://localhost:${HTTPS_PORT}`));
        } else {
            throw new Error("Certs not found");
        }
    } catch (e) {
        console.warn("HTTPS failed:", e?.message);
        server = http.createServer(app);
        io = initializeSocketIO(server);
        server.listen(PORT, () => console.log(`\n HTTP: http://localhost:${PORT}`));
    }
}

export default app;
