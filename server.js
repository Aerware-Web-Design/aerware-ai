require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Restrict CORS to your domain (update with your actual domain)
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000'
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
    service: 'Gmail', // Or your chosen email service
    auth: {
        user: process.env.EMAIL_USER, // Authenticated email account
        pass: process.env.EMAIL_PASS, // Corresponding password or app-specific password
    },
});

app.post('/send-email', (req, res) => {
    const { name, email, message } = req.body;

    // Input validation
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    // Sanitize inputs (basic protection)
    const sanitizedName = name.substring(0, 100).trim();
    const sanitizedEmail = email.substring(0, 100).trim();
    const sanitizedMessage = message.substring(0, 1000).trim();

    const mailOptions = {
        from: 'info@aerware.ai', // Displayed sender email
        to: 'info@aerware.ai',   // The recipient email address (or another address if needed)
        subject: `New Contact Form Submission from ${sanitizedName}`,
        text: `Name: ${sanitizedName}\nEmail: ${sanitizedEmail}\nMessage: ${sanitizedMessage}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Failed to send message. Please try again later.' });
        } else {
            console.log('Email sent:', info.response);
            res.status(200).json({ success: 'Email sent successfully' });
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
