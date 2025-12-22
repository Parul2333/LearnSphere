import sgMail from '@sendgrid/mail';
import Feedback from '../models/Feedback.js';

// Styles for the email
const styles = {
    container: "max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333;",
    header: "background-color: #4F46E5; color: #ffffff; padding: 25px; text-align: center; border-radius: 8px 8px 0 0;",
    body: "background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;",
    footer: "text-align: center; font-size: 12px; color: #6b7280; margin-top: 20px;",
    quote: "background-color: #f3f4f6; border-left: 4px solid #4F46E5; padding: 15px; font-style: italic; margin: 20px 0;"
};

export const submitContactForm = async (req, res) => {
    // 🟢 FIX: Initialize SendGrid INSIDE the function
    // This ensures .env is loaded before we try to use the key
    if (process.env.SENDGRID_API_KEY) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    } else {
        console.error("❌ SendGrid Error: API Key is missing in .env");
        return res.status(500).json({ message: 'Server email configuration error.' });
    }

    const { name, email, subject, message, type = 'contact', userId } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    try {
        // 1. Save to Database
        const feedback = await Feedback.create({
            name, email, subject, message, type, user: userId || null
        });

        console.log(`[Contact] Saved to DB. Now sending emails to: ${email} and Admin...`);

        // 2. Prepare Email Content
        let userSubject, userHtml;

        if (type === 'feedback') {
            userSubject = `Thanks for your feedback, ${name}!`;
            userHtml = `
                <div style="${styles.container}">
                    <div style="${styles.header}"><h1 style="margin:0; font-size: 24px;">Thank You!</h1></div>
                    <div style="${styles.body}">
                        <p>Hi ${name},</p>
                        <p>We appreciate your feedback for <strong>LearnSphere</strong>.</p>
                        <div style="${styles.quote}">"${message}"</div>
                        <p>Best regards,<br><strong>The LearnSphere Team</strong></p>
                    </div>
                </div>`;
        } else {
            userSubject = `Request Received: ${subject}`;
            userHtml = `
                <div style="${styles.container}">
                    <div style="${styles.header}"><h1 style="margin:0; font-size: 24px;">Request Received</h1></div>
                    <div style="${styles.body}">
                        <p>Hello ${name},</p>
                        <p>We received your message regarding "<strong>${subject}</strong>". We will reply within 24 hours.</p>
                        <p><strong>Ticket ID:</strong> #${feedback._id}</p>
                    </div>
                </div>`;
        }

        const userAutoReply = {
            to: email, 
            from: process.env.SENDGRID_VERIFIED_SENDER, // Must match your verified sender in .env
            subject: userSubject,
            html: userHtml
        };

        const adminMsg = {
            to: process.env.CONTACT_EMAIL, // Your Admin Email
            from: process.env.SENDGRID_VERIFIED_SENDER,
            replyTo: email,
            subject: `[${type.toUpperCase()}] New Submission from ${name}`,
            html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message}</p>`
        };

        // 3. Send Emails
        try {
            await Promise.all([
                sgMail.send(adminMsg),
                sgMail.send(userAutoReply)
            ]);
            console.log(`✅ Emails sent successfully to ${process.env.CONTACT_EMAIL} and ${email}`);
            res.status(201).json({ message: 'Message sent successfully!', success: true });
        } catch (emailError) {
            console.error("❌ SendGrid Delivery Error:", emailError.response ? emailError.response.body : emailError);
            // We still return success to the user because the DB save worked
            res.status(201).json({ message: 'Message saved (Email delivery pending).', success: true });
        }

    } catch (error) {
        console.error('❌ Controller Error:', error);
        res.status(500).json({ message: 'Server error processing request' });
    }
};