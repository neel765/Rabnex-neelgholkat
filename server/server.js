// server/server.js
const path = require("path");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const fs = require("fs");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(cors());
app.use(express.json());

// -------- CONFIG --------
const PORT = process.env.PORT || 4000;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;

// -------- RATE LIMIT (prevents abuse) --------
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // max requests per IP per minute
});
app.use("/send", limiter);

// -------- SAFETY CHECKS --------
if (!GMAIL_USER || !GMAIL_PASS) {
  console.warn("❌ WARNING: GMAIL_USER or GMAIL_PASS not set. Email will fail until you set env vars.");
}

// -------- MAIL TRANSPORT (reads from env) --------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS,
  },
  pool: true,
  secure: true, // uses TLS
});

transporter.verify()
  .then(() => console.log("✅ Gmail SMTP connected"))
  .catch(err => {
    console.warn("⚠️ Gmail verify failed:", err && err.message ? err.message : err);
    if (err && err.code === "EAUTH") {
      console.warn("→ EAUTH: check GMAIL_USER/GMAIL_PASS (app password) or recreate app password.");
    }
  });

// -------- API: send (registered BEFORE static fallback) --------
app.post("/send", async (req, res) => {
  console.log("[/send] incoming body:", JSON.stringify(req.body || {}).substring(0, 1000)); // truncate long bodies
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Missing name, email or message" });
  }

  if (!GMAIL_USER || !GMAIL_PASS) {
    console.error("❌ Missing GMAIL_USER or GMAIL_PASS (env)");
    return res.status(500).json({ success: false, message: "Server misconfiguration: email credentials missing" });
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
    console.log(`📧 Sent message from ${name} <${email}>`);
    return res.status(200).json({ success: true, message: "Message sent" });
  } catch (err) {
    console.error("[/send] Email send error:", err && err.stack ? err.stack : err);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: err && err.message ? err.message : undefined, // helpful for debugging; remove in prod
    });
  }
});

// -------- STATIC FRONTEND --------
// Look for build folders in common locations
const candidateDirs = [
  path.join(__dirname, "../dist"),
  path.join(__dirname, "dist"),
  path.join(__dirname, "../build"),
  path.join(__dirname, "build"),
];

let staticDir = candidateDirs.find(d => {
  try { return fs.existsSync(d) && fs.statSync(d).isDirectory(); } catch (e) { return false; }
});

if (staticDir) {
  console.log("✅ Serving static from:", staticDir);
  app.use(express.static(staticDir));

  // SPA fallback: use regex instead of '*' to avoid path-to-regexp errors
  app.get(/.*/, (req, res, next) => {
    // Do not intercept API calls (if your API uses /api/* change this list)
    if (req.path.startsWith("/send") || req.path.startsWith("/api") || req.path.startsWith("/health")) return next();
    res.sendFile(path.join(staticDir, "index.html"), err => {
      if (err) {
        console.error("❌ Failed to send index.html:", err && err.message ? err.message : err);
        res.status(500).send("Server error");
      }
    });
  });
} else {
  console.warn("⚠️ No static build found. Expected one of:", candidateDirs);
  app.get("/", (req, res) => res.send("Backend running. No static build found."));
}

// -------- HEALTH --------
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// -------- START SERVER --------
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
