// ============================================
// HPTECH PORTFOLIO - BACKEND SERVER
// ============================================

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Resend } = require("resend");
const sanitizeHtml = require("sanitize-html");
require("dotenv").config();

const app = express();

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet.js for security headers
app.use(helmet());

// CORS Configuration
const allowedOrigins = [
  "https://hptech.vercel.app", // Your production domain
  "https://hptech.netlify.app", // Alternative domain
  "http://localhost:3000", // Local development
  "http://localhost:5000", // Local backend
  "http://localhost:5500", // Live Server
  "http://127.0.0.1:5500", // Live Server
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400, // 24 hours
  }),
);

// Handle preflight requests
app.options("*", cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many requests. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to contact form endpoint
app.use("/send", limiter);

// Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "10kb" })); // Limit payload size

// ============================================
// INPUT SANITIZATION
// ============================================
function sanitizeInput(input) {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
    textFilter: function (text) {
      return text.replace(/[<>]/g, ""); // Remove any HTML tags
    },
  });
}

// ============================================
// VALIDATION
// ============================================
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateFormData(name, email, message) {
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long.");
  }

  if (!email || !validateEmail(email)) {
    errors.push("Please provide a valid email address.");
  }

  if (!message || typeof message !== "string" || message.trim().length < 10) {
    errors.push("Message must be at least 10 characters long.");
  }

  // Check for maximum lengths
  if (name && name.length > 100) errors.push("Name is too long.");
  if (email && email.length > 254) errors.push("Email is too long.");
  if (message && message.length > 5000) errors.push("Message is too long.");

  return errors;
}

// ============================================
// INITIALIZE RESEND
// ============================================
const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Contact form endpoint
app.post("/send", async (req, res) => {
  console.log(`[${new Date().toISOString()}] Contact form submission received`);

  try {
    // Extract and sanitize form data
    const name = sanitizeInput(req.body.name || "");
    const email = sanitizeInput(req.body.email || "");
    const subject = sanitizeInput(req.body.subject || "No subject");
    const message = sanitizeInput(req.body.message || "");

    // Validate form data
    const validationErrors = validateFormData(name, email, message);
    if (validationErrors.length > 0) {
      console.log("Validation failed:", validationErrors);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Check honeypot (if included)
    if (req.body.honeypot) {
      console.log("Honeypot triggered - possible bot submission");
      // Silently accept but don't send email
      return res.status(200).json({
        success: true,
        message: "Message sent successfully!",
      });
    }

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // CHANGE THESE EMAIL ADDRESSES
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    const response = await resend.emails.send({
      from: "HPTech Portfolio <onboarding@resend.dev>", // ← CHANGE THIS
      to: process.env.RECEIVER_EMAIL || "alimiazeez4@gmail.com", // ← CHANGE THIS
      reply_to: email,
      subject: `Portfolio Contact: ${subject} - from ${name}`,
      html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                            line-height: 1.6;
                            color: #1a1a1a;
                            background: #F8F7F2;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 2rem;
                            background: white;
                            border-radius: 16px;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #1D9E75, #085041);
                            color: white;
                            padding: 2rem;
                            border-radius: 12px;
                            margin-bottom: 2rem;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-family: 'Space Grotesk', sans-serif;
                            font-size: 1.5rem;
                        }
                        .field {
                            margin-bottom: 1.5rem;
                            padding-bottom: 1.5rem;
                            border-bottom: 1px solid #E1F5EE;
                        }
                        .field:last-child {
                            border-bottom: none;
                        }
                        .label {
                            font-size: 0.75rem;
                            text-transform: uppercase;
                            letter-spacing: 2px;
                            color: #1D9E75;
                            margin-bottom: 0.5rem;
                            font-weight: 600;
                        }
                        .value {
                            font-size: 1rem;
                            color: #1a1a1a;
                        }
                        .message-box {
                            background: #F8F7F2;
                            padding: 1.5rem;
                            border-radius: 8px;
                            border-left: 4px solid #1D9E75;
                            margin-top: 0.5rem;
                        }
                        .footer {
                            margin-top: 2rem;
                            padding-top: 1rem;
                            border-top: 1px solid #E1F5EE;
                            text-align: center;
                            font-size: 0.85rem;
                            color: #888780;
                        }
                        .badge {
                            display: inline-block;
                            background: #FAECE7;
                            color: #D85A30;
                            padding: 0.25rem 0.75rem;
                            border-radius: 20px;
                            font-size: 0.75rem;
                            font-weight: 600;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🚀 New Portfolio Contact</h1>
                            <p style="margin-top: 0.5rem; opacity: 0.9;">From HPTech Portfolio Website</p>
                        </div>
                        
                        <div class="field">
                            <div class="label">From</div>
                            <div class="value">${name}</div>
                        </div>
                        
                        <div class="field">
                            <div class="label">Email</div>
                            <div class="value">
                                <a href="mailto:${email}" style="color: #1D9E75;">${email}</a>
                            </div>
                        </div>
                        
                        <div class="field">
                            <div class="label">Subject</div>
                            <div class="value">
                                <span class="badge">${subject}</span>
                            </div>
                        </div>
                        
                        <div class="field">
                            <div class="label">Message</div>
                            <div class="message-box">
                                ${message.replace(/\n/g, "<br>")}
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>📬 Sent via HPTech Portfolio Contact Form</p>
                            <p style="font-size: 0.75rem;">${new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" })} WAT</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
      text: `New contact form submission\n\nFrom: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}\n\n---\nSent via HPTech Portfolio - ${new Date().toISOString()}`,
    });

    console.log("Email sent successfully:", response.id);

    // Send success response
    res.status(200).json({
      success: true,
      message:
        "Message sent successfully! I'll get back to you within 24 hours.",
      id: response.id,
    });
  } catch (error) {
    console.error("Error sending email:", error);

    // Send error response
    res.status(500).json({
      success: false,
      message:
        "Failed to send message. Please try again or email me directly at alimiazeez4@gmail.com",
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
    ╔══════════════════════════════════════════╗
    ║  🚀 HPTech Portfolio Backend Running!   ║
    ║  Port: ${PORT}                            ║
    ║  Environment: ${process.env.NODE_ENV || "development"}              ║
    ║  API: http://localhost:${PORT}/send        ║
    ╚══════════════════════════════════════════╝
    `);
});

module.exports = app;
