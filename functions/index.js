const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ✅ Gmail transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rabnexinnovation@gmail.com", // your Gmail
    pass: "elvnmahkuaopzjsc",          // your Google App Password
  },
});

// Verify connection
transporter
  .verify()
  .then(() => console.log("✅ Gmail SMTP connected successfully"))
  .catch((err) => console.error("❌ Connection failed:", err));

// ✅ Contact form endpoint
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  // Mail to admin (you)
  const adminMail = {
    from: `"${name}" <rabnexinnovation@gmail.com>`,
    to: "neelgholkar@gmail.com", // your receiving email
    subject: `New Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    replyTo: email, // 👈 reply will go to the sender
  };

  // Auto reply to customer
  const autoReply = {
    from: `"Rabnex Innovations" <rabnexinnovation@gmail.com>`,
    to: email,
    subject: `✅ Thanks for contacting Rabnex, ${name}!`,
    text: `Hi ${name},\n\nThank you for reaching out to us.\n\nYour message:\n"${message}"\n\nOur team will contact you soon.\n\nBest regards,\nRabnex Innovations`,
  };

  try {
    await transporter.sendMail(adminMail);
    await transporter.sendMail(autoReply);
    res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    res.status(500).json({ success: false, message: "Failed to send message." });
  }
});

// Export as Firebase Function
exports.api = functions.https.onRequest(app);
