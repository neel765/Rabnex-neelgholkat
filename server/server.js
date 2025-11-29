import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve React build (Vite dist folder)
app.use(express.static(path.join(__dirname, "../dist")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// ✅ Gmail transporter (use ENV variables, NOT hard-coded)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Verify connection (will fail on Render Free — expected)
transporter
  .verify()
  .then(() => console.log("✅ Gmail SMTP connected successfully"))
  .catch((err) => console.error("❌ SMTP blocked or failed:", err.message));

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
    text: `Hi ${name},\n\nThank you for reaching out to us. We’ve received your message:\n\n"${message}"\n\nOur team will get back to you soon.\n\nBest,\nRabnex Team`,
  };

  try {
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(autoReply);

    console.log(`📧 Message received from ${name} <${email}>`);
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
