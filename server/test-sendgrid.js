import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Load Environment Variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Trying to load from parent folder (../.env) like your server.js does
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log("--- SendGrid Debugger ---");
console.log("Looking for .env at:", path.join(__dirname, '../.env'));

// 2. Check Variables
const apiKey = process.env.SENDGRID_API_KEY;
const sender = process.env.SENDGRID_VERIFIED_SENDER;

console.log("API Key found?", apiKey ? "✅ YES" : "❌ NO");
console.log("Verified Sender:", sender || "❌ MISSING");

if (!apiKey || !sender) {
    console.error("\n❌ ERROR: Missing configuration in .env file.");
    process.exit(1);
}

// 3. Configure SendGrid
sgMail.setApiKey(apiKey);

// 4. Attempt to Send
const msg = {
    to: sender, // Sending to yourself to test
    from: sender, // MUST be the verified sender
    subject: 'LearnSphere SendGrid Test',
    text: 'If you receive this, your SendGrid configuration is correct!',
    html: '<strong>If you receive this, your SendGrid configuration is correct!</strong>',
};

(async () => {
    try {
        console.log("\nAttempting to send email...");
        await sgMail.send(msg);
        console.log("✅ SUCCESS! Email sent to", sender);
        console.log("Check your inbox (and spam folder).");
    } catch (error) {
        console.error("\n❌ FAILED to send email.");
        if (error.response) {
            console.error("Error Body:", JSON.stringify(error.response.body, null, 2));
        } else {
            console.error(error);
        }
    }
})();