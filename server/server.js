const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ SERVE REACT BUILD (VERY IMPORTANT)
app.use(express.static(path.join(__dirname, "../dist")));

// ✅ ROOT ROUTE → LOADS REACT FRONTEND
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// ✅ HEALTH CHECK (optional, but useful)
app.get("/health", (req, res) => {
  res.status(200).send("✅ Server + Frontend running on Render");
});

// ✅ GMAIL TRANSPORTER (ENV ONLY)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ CONTACT API
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      replyTo: email,
    };

    const autoReply = {
      from: `"Rabnex Innovations" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thanks for contacting Rabnex!",
      text: `Hi ${name},\n\nWe received your message and will reply soon.\n\nRabnex Team`,
    };

    await transporter.sendMail(mailOptions);
    await transporter.sendMail(autoReply);

    res.status(200).json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("❌ Email error:", error.message);
    res.status(500).json({ success: false, message: "Email failed" });
  }
});

// ✅ RENDER DYNAMIC PORT (CRITICAL)
const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server + Frontend running on port ${PORT}`);
});
