const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Resend } = require("resend");
require("dotenv").config();

const app = express();

// ----------- FIXED CORS FOR RENDER + EXPRESS 5 -----------
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Handle ALL preflight (OPTIONS) requests safely for Express 5
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.sendStatus(204);
  }
  next();
});
// -----------------------------------------------------------

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// POST route to handle form submission
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const response = await resend.emails.send({
      from: "Your Portfolio <onboarding@resend.dev>",
      to: process.env.RECEIVER_EMAIL,
      subject: `New message from ${name}`,
      text: `From: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    console.log("Email sent:", response);
    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
