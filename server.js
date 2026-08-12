require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const axios = require('axios');

// reCAPTCHA verification function
const response = await axios.post(
  `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${token}`,
  {},
  { timeout: 5000 }
);

const path = require("path");




const rateLimit = require("express-rate-limit");

const app = express();
app.set('trust proxy', 1);

// Retrieve environment variables
const PORT = process.env.PORT || 5000;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_TO = process.env.EMAIL_TO;
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;

// Setup CORS configuration based on environment variables
const allowedOrigins = ALLOWED_ORIGIN 
    ? ALLOWED_ORIGIN.split(",") 
    : ["http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:5000"];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin static assets)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Blocked request from origin: ${origin}`);
            callback(new Error("Not allowed by CORS"));
        }
    },
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Set up rate limiting to prevent spam submissions on the API
const quoteRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10, // Limit each IP to 10 submissions per 15-minute window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests from this IP. Please try again after 15 minutes."
    }
});

// Helper function to sanitize user inputs to prevent XSS injection
function sanitizeString(str) {
    if (typeof str !== "string") return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
}

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'mail.skyhaultransit.com',
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: true, // Port 465 ke liye true
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // Certificate validation issue bypass karne ke liye
  }
});

// Verify email configuration on startup
if (EMAIL_USER && EMAIL_PASS) {
    transporter.verify((error, success) => {
        if (error) {
            console.error("❌ Nodemailer verification failed:", error.message);
        } else {
            console.log("✅ Email system is ready to deliver messages.");
        }
    });
} else {
    console.warn("⚠️ Warning: EMAIL_USER or EMAIL_PASS environment variables are missing. Email sending will fail.");
}

// 📬 Quote submission endpoint
app.post('/send-quote', async (req, res) => { // ✅ 'async' add kiya
    try {
        const { recaptchaToken } = req.body;

        // reCAPTCHA verification
        const googleRes = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${recaptchaToken}`
        );

        if (!googleRes.data.success) {
            return res.status(400).json({ success: false, message: 'reCAPTCHA verification failed' });
        }

        // Baki email bhejne ka logic yahan...
        
    } catch (error) {
        console.error('Submission Handler Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
    // 1. Validate required fields
    const requiredFields = ["name", "email", "origin", "destination", "recaptcha"];
    for (const field of requiredFields) {
        if (!data[field] || typeof data[field] !== "string" || data[field].trim() === "") {
            return res.status(400).json({ 
                success: false, 
                message: `Missing or empty required field: ${field}` 
            });
        }
    }

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        return res.status(400).json({ success: false, message: "Invalid email address format." });
    }

    // 3. Verify Google reCAPTCHA v2
    const verifyURL = "https://www.google.com/recaptcha/api/siteverify";
    try {
        const captchaRes = await axios.post(
            verifyURL,
            new URLSearchParams({
                secret: RECAPTCHA_SECRET,
                response: data.recaptcha
            }).toString(),
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                timeout: 6000 // 6 seconds timeout
            }
        );

        if (!captchaRes.data || !captchaRes.data.success) {
            console.warn("⚠️ reCAPTCHA verification failed:", captchaRes.data);
            return res.status(400).json({ success: false, message: "reCAPTCHA verification failed." });
        }

        // 4. Construct beautiful HTML email including all collected fields
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; color: #333333; line-height: 1.6; background-color: #f4f6f8; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-top: 6px solid #002244; }
            .header { background-color: #002244; color: #ffffff; padding: 25px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 0.5px; }
            .header p { margin: 5px 0 0 0; font-size: 13px; opacity: 0.85; }
            .content { padding: 30px; }
            .section-title { font-size: 15px; font-weight: bold; color: #002244; border-bottom: 2px solid #e1e8ed; padding-bottom: 6px; margin-top: 25px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
            .grid { display: table; width: 100%; border-collapse: collapse; }
            .row { display: table-row; }
            .label { display: table-cell; width: 35%; padding: 8px 5px; font-weight: bold; color: #555555; border-bottom: 1px solid #f0f0f0; vertical-align: top; font-size: 14px; }
            .value { display: table-cell; width: 65%; padding: 8px 5px; color: #222222; border-bottom: 1px solid #f0f0f0; vertical-align: top; font-size: 14px; }
            .notes-box { background-color: #f8fafc; border-left: 4px solid #002244; padding: 15px; margin-top: 10px; font-style: italic; border-radius: 0 4px 4px 0; color: #475569; font-size: 14px; }
            .footer { background-color: #f8fafc; text-align: center; padding: 15px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Freight Quote Request</h1>
              <p>SKYHAUL TRANSIT INC. — Lead Capture Portal</p>
            </div>
            <div class="content">
              
              <div class="section-title">Contact details</div>
              <div class="grid">
                <div class="row"><div class="label">Name:</div><div class="value">${sanitizeString(data.name)}</div></div>
                <div class="row"><div class="label">Email:</div><div class="value"><a href="mailto:${sanitizeString(data.email)}" style="color: #002244; text-decoration: underline;">${sanitizeString(data.email)}</a></div></div>
                <div class="row"><div class="label">Phone:</div><div class="value">${data.phone ? sanitizeString(data.phone) : "Not Provided"}</div></div>
                <div class="row"><div class="label">Company:</div><div class="value">${data.company ? sanitizeString(data.company) : "Not Provided"}</div></div>
              </div>

              <div class="section-title">Route information</div>
              <div class="grid">
                <div class="row"><div class="label">Origin:</div><div class="value">${sanitizeString(data.origin)}</div></div>
                <div class="row"><div class="label">Destination:</div><div class="value">${sanitizeString(data.destination)}</div></div>
                <div class="row"><div class="label">Shipment Date:</div><div class="value">${data.date ? sanitizeString(data.date) : "Not Provided"}</div></div>
              </div>

              <div class="section-title">Cargo Specifications</div>
              <div class="grid">
                <div class="row"><div class="label">Equipment Type:</div><div class="value">${data.equipment ? sanitizeString(data.equipment) : "Not Provided"}</div></div>
                <div class="row"><div class="label">Weight (lbs):</div><div class="value">${data.weight ? sanitizeString(data.weight) : "Not Provided"}</div></div>
                <div class="row"><div class="label">Commodity:</div><div class="value">${data.commodity ? sanitizeString(data.commodity) : "Not Provided"}</div></div>
              </div>

              ${data.notes && data.notes.trim() !== "" ? `
                <div class="section-title">Additional Comments</div>
                <div class="notes-box">${sanitizeString(data.notes)}</div>
              ` : ""}

            </div>
            <div class="footer">
              This email was automatically generated by the Skyhaul Transit quote system. Please click reply to respond directly to the sender.
            </div>
          </div>
        </body>
        </html>
        `;

        // 5. Send email with Reply-To designated to the client's email address
        const mailOptions = {
            from: `"Skyhaul Lead Capture" <${EMAIL_USER}>`,
            to: EMAIL_TO,
            replyTo: data.email,
            subject: `New Freight Quote Lead: ${sanitizeString(data.name)} (${sanitizeString(data.origin)} ➔ ${sanitizeString(data.destination)})`,
            html: htmlContent
        };

        await transporter.sendMail(mailOptions);
        console.log("📨 Lead notification email successfully sent to:", EMAIL_TO);
        
        return res.json({ success: true, message: "Quote submitted successfully." });

    } catch (error) {
        console.error("❌ Submission Handler Error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "An internal server error occurred while processing your request. Please try again." 
        });
    }
});

// Serve frontend static assets from the current directory (for production/deployment self-containment)
app.use(express.static(path.join(__dirname, ".")));

// Catch-all route to serve the index.html for undefined requests (supporting single port serving)
app.get("/*splat", (req, res, next) => {
    // Only return index.html for GET requests that accept HTML
    if (req.method === "GET" && req.accepts("html") && !req.path.startsWith("/send-quote")) {
        return res.sendFile(path.join(__dirname, "index.html"));
    }
    next();
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("🔥 Global Unhandled Exception:", err);
    res.status(500).json({ 
        success: false, 
        message: "A critical server error occurred." 
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is successfully listening on http://localhost:${PORT}`);
});
