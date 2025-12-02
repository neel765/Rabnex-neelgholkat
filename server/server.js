// server.js - drop-in for Render (no dotenv)
const path = require("path");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// ---------- CONFIG ----------
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;
const PORT = process.env.PORT || 4000;

// ---------- TRANSPORTER ----------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});
transporter.verify()
  .then(() => console.log("✅ Gmail SMTP connected"))
  .catch(err => console.warn("⚠️ Gmail verify failed:", err && err.message));

// ---------- STATIC FRONTEND ----------
// Adjust `FRONTEND_DIR` if your build is not in 'dist'
const FRONTEND_DIR = path.join(__dirname, "../dist"); // common for monorepos
// Fallback: try project root /dist or /build
const tryDirs = [
  FRONTEND_DIR,
  path.join(__dirname, "dist"),
  path.join(__dirname, "../build"),
  path.join(__dirname, "build"),
];

// find the first existing dir
const fs = require("fs");
let staticDir = tryDirs.find(d => {
  try { return fs.existsSync(d) && fs.statSync(d).isDirectory(); } catch (e) { return false; }
});

if (staticDir) {
  console.log("✅ Serving static from:", staticDir);
  app.use(express.static(staticDir));
  // serve index.html for any non-API route (lets SPA routing work)
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/send")) return next();
    res.sendFile(path.join(staticDir, "index.html"), err => {
      if (err) {
        console.error("❌ Failed to send index.html:", err);
        res.status(500).send("Server error");
      }
    });
  });
} else {
  console.warn("⚠️ No static build found. Static routes disabled. Expected one of:", tryDirs);
  // Provide a simple root endpoint so Render health checks succeed
  app.get("/", (req, res) => res.send("Backend running. No static build found."));
}

// ---------- CONTACT API ----------
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Missing name / email / message" });
  }
  if (!GMAIL_USER || !GMAIL_PASS) {
    console.error("❌ Missing GMAIL_USER or GMAIL_PASS");
    return res.status(500).json({ success: false, message: "Server misconfiguration" });
  }

  const mailToAdmin = {
    from: `"${name}" <${GMAIL_USER}>`,
    to: GMAIL_USER,
    subject: `New Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
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
    console.log(`📧 Sent message from ${name} <${email}>`);
    return res.json({ success: true, message: "Message sent" });
  } catch (err) {
    console.error("❌ Email send error:", err && err.message ? err.message : err);
    return res.status(500).json({ success: false, message: "Failed to send message" });
  }
});

// ---------- SIMPLE HEALTH / LOGGING ----------
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// ---------- START ----------
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
