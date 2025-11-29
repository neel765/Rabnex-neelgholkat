// server.js
require("dotenv").config(); // only for local dev; Render will use env vars
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(cors());
app.use(express.json());

// -- Basic rate limiter to reduce abuse (adjust as needed)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // max 10 requests per IP per minute
});
app.use("/send", limiter);

// -- Fail fast if env missing
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;

if (!GMAIL_USER || !GMAIL_PASS) {
  console.error("❌ Missing GMAIL_USER or GMAIL_PASS environment variables");
  // don't crash the process in production; but note this clearly
}

// -- transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
  pool: true, // use pool for moderate traffic
  secure: true,
});

// verify connection once on startup (useful for debugging)
transporter.verify()
  .then(() => console.log("✅ Gmail SMTP connected successfully"))
  .catch((err) => {
    console.error("❌ Gmail SMTP verify failed:", err && err.message ? err.message : err);
  });

// -- Contact form endpoint
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Missing name, email or message" });
  }

  // prevent sending back to yourself by accident
  const adminEmail = GMAIL_USER;

  const mailOptions = {
    from: `"${name}" <${adminEmail}>`,
    to: adminEmail,
    subject: `New Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    replyTo: email,
  };

  const autoReply = {
    from: `"Rabnex Innovations" <${adminEmail}>`,
    to: email,
    subject: `✅ Thanks for contacting Rabnex, ${name}!`,
    text: `Hi ${name},\n\nThanks for contacting Rabnex Innovations. We received your message:\n\n"${message}"\n\nWe will reply soon.\n\n— Rabnex Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    // small delay/await for second send to avoid race
    await transporter.sendMail(autoReply);
    console.log(`📧 Message from ${name} <${email}> delivered to ${adminEmail}`);
    return res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error("❌ Email sending failed:", err && err.message ? err.message : err);
    // if Google returns auth error, propagate the status for debugging
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: err && err.message ? err.message : undefined,
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
