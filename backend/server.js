const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Resend } = require("resend");
require("dotenv").config();

const app = express();


app.use(
  cors({
    origin: ["https://hptech.netlify.app"],
    methods: ["POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());
const resend = new Resend(process.env.RESEND_API_KEY);

//  Email handler
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message)
    return res.status(400).json({ success: false, message: "All fields are required." });

  try {
    const response = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>",
      to: process.env.RECEIVER_EMAIL,
      subject: `New message from ${name}`,
      html: `
        <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    if (process.env.NODE_ENV !== "production")
      console.log("Email response:", response);

    return res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Email send error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to send email." });
  }
});

//  Health check route
app.get("/health", (req, res) =>
  res.json({ ok: true, env: process.env.NODE_ENV || "development" })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
