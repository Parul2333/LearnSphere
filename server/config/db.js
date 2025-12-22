// D:/4th Year/BEE-2/server/config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// 1. CRITICAL FIX: Explicitly specify the path to the .env file 
// relative to the Node process's current working directory.
// Assuming your .env file is in the server root (D:/4th Year/BEE-2/server/.env).
// This ensures that both the main server and the Cypress Task processes can find it.
dotenv.config({ path: '.env' }); 

const connectDB = async () => {
    try {
        // Guard clause: Check if MONGO_URI is loaded before attempting connection
        if (!process.env.MONGO_URI) {
             throw new Error("MONGO_URI is not defined. Check your .env file and dotenv path configuration.");
        }
        
        // Use an option to ensure the connection is attempted even if the task is slow
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s if selection fails
            // Removed deprecated options like useNewUrlParser/useUnifiedTopology
        }); 
        
        console.log(`\n✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`\n❌ Error connecting to MongoDB: ${error.message}`);
        // Exit process with failure (required for main server)
        process.exit(1); 
    }
};

export default connectDB;