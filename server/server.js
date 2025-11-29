const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Serve React build
app.use(express.static(path.join(__dirname, "../dist")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// ✅ Gmail transporter using ENV vars
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Contact form endpoint
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

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
    subject: `✅ Thanks for contacting Rabnex, ${name}!`,
    text: `Hi ${name},\n\nThank you for reaching out. We received your message:\n\n"${message}"\n\nOur team will reply soon.\n\nBest,\nRabnex Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(autoReply);
    res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    res.status(500).json({ success: false, message: "Failed to send message." });
  }
});

// ✅ Use Render dynamic port
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
