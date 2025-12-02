// server/server.js
const path = require("path");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// -------- CONFIG --------
const PORT = process.env.PORT || 4000;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;

// -------- MAIL TRANSPORT --------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
});

transporter.verify()
  .then(() => console.log("✅ Gmail SMTP connected"))
  .catch(err => console.warn("⚠️ Gmail verify failed:", err.message));

// -------- API: /send --------
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  if (!GMAIL_USER || !GMAIL_PASS) {
    console.error("❌ Missing GMAIL_USER or GMAIL_PASS (env)");
    return res.status(500).json({ success: false, message: "Email credentials missing" });
  }

  const mailToAdmin = {
    from: `"${name}" <${GMAIL_USER}>`,
    to: GMAIL_USER,
    subject: `New Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    replyTo: email,
  };

  const mailToUser = {
    from: `"Rabnex Innovations" <${GMAIL_USER}>`,
    to: email,
    subject: `Thanks for contacting Rabnex, ${name}!`,
    text: `Hi ${name},\n\nThanks for your message:\n"${message}"\n\n— Rabnex Team`,
  };

  try {
    await transporter.sendMail(mailToAdmin);
    await transporter.sendMail(mailToUser);
    res.json({ success: true, message: "Message sent" });
  } catch (err) {
    console.error("❌ Email send error:", err.message);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

// -------- STATIC FRONTEND --------
const possibleDirs = [
  path.join(__dirname, "../dist"),
  path.join(__dirname, "dist"),
  path.join(__dirname, "../build"),
  path.join(__dirname, "build"),
];

let staticDir = possibleDirs.find(d => {
  try { return fs.existsSync(d) && fs.statSync(d).isDirectory(); }
  catch { return false; }
});

if (staticDir) {
  console.log("✅ Serving static from:", staticDir);
  app.use(express.static(staticDir));

  // SPA fallback
  app.get(/.*/, (req, res) => {
    if (req.path.startsWith("/send") || req.path.startsWith("/api")) return;
    res.sendFile(path.join(staticDir, "index.html"));
  });
} else {
  console.warn("⚠️ No build found. Expected one of:", possibleDirs);
  app.get("/", (req, res) => res.send("Backend is running. No static files found."));
}

// -------- HEALTH --------
app.get("/health", (req, res) => res.json({ status: "ok" }));

// -------- START --------
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
