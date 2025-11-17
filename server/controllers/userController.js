// userController.js (ESM version)
import User from "../models/User.js"; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 💡 NEW IMPORTS: Rate Limiter functions
import { trackFailedLogin, trackSuccessfulLogin, resetLoginAttempts, LOCKOUT_TIME_SECONDS } from "../middleware/rateLimiter.js";
import redis from "../config/redis.js";


// Helper function to generate JWT token
const generateToken = (id, role, rememberMe = false) => {
    // 💡 REMEMBER ME FIX: Token expiration should be longer if remembered
    const expiresIn = rememberMe ? "90d" : "1d"; 

    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn,
    });
};

// @desc    Register a new user 
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            // Check 1: User found in the database
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || "user", // Default to 'user'
        });

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
        });
    } catch (error) {
        // ✅ CRITICAL FIX: Check for MongoDB Duplicate Key Error (Code 11000)
        // This ensures a 400 is returned instead of crashing the server with a 500
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already in use. Please try logging in." });
        }
        
        res
            .status(500)
            .json({ message: "Server error during registration", error: error.message });
    }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    const { email, password, rememberMe } = req.body; // 💡 Get rememberMe flag
    
    // Debug logging
    console.log(`[Login] Attempt for: ${email}, rememberMe: ${rememberMe} (type: ${typeof rememberMe})`);

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            
            // 💡 SUCCESS: Reset failure count and track successful login
            await resetLoginAttempts(email);
            
            // Track successful login with metadata for auditing
            await trackSuccessfulLogin(email, {
                ip: req.ip || req.connection?.remoteAddress,
                userAgent: req.get('user-agent')
            });

            const token = generateToken(user._id, user.role, rememberMe);

            // 💡 REMEMBER ME CACHE: Store token in Redis if requested
            if (rememberMe) {
                if (!redis) {
                    console.warn('[Remember Me] Redis not available, cannot store session');
                } else if (redis.status !== 'ready') {
                    console.warn(`[Remember Me] Redis status: ${redis.status}, cannot store session`);
                } else {
                    try {
                        const sessionKey = `user_session:${user._id}`;
                        // Store the token for a long period (90 days)
                        await redis.set(sessionKey, token, 'EX', 90 * 24 * 60 * 60);
                        console.log(`[Remember Me] Session stored in Redis: ${sessionKey} (90 days)`);
                    } catch (error) {
                        console.error('[Remember Me] Failed to store session in Redis:', error);
                    }
                }
            } else {
                console.log('[Remember Me] Not requested, skipping Redis session storage');
            }

            return res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: token,
            });
        } else {
            // 💡 FAILURE: Track failed attempt with metadata and detect lockout
            const locked = await trackFailedLogin(email, {
                ip: req.ip || req.connection?.remoteAddress,
                userAgent: req.get('user-agent')
            });

            if (locked) {
                // Client should be informed the account is locked for LOCKOUT_TIME_SECONDS
                res.set('Retry-After', String(LOCKOUT_TIME_SECONDS));
                return res.status(429).json({ message: `Account locked due to failed login attempts. Try again in ${Math.ceil(LOCKOUT_TIME_SECONDS/60)} minutes.` });
            }

            return res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res
            .status(500)
            .json({ message: "Server error during login", error: error.message });
    }
};

// @desc    Get current logged-in user details 
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
};