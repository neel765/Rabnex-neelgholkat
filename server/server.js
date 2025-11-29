const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ SIMPLE HEALTH CHECK (confirms server is running)
app.get("/health", (req, res) => {
  res.status(200).send("✅ Server is running on Render");
});

// ✅ Gmail transporter (use ENV variables only)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Your /send API
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

// ✅ MOST IMPORTANT PART — RENDER PORT BINDING
const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server ACTUALLY running on Render on port ${PORT}`);
});
