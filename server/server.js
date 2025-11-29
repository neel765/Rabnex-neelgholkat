const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ------------------------------
//  READ ENVIRONMENT VARIABLES
// ------------------------------
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;

if (!GMAIL_USER || !GMAIL_PASS) {
  console.error("❌ ERROR: Missing GMAIL_USER or GMAIL_PASS environment variables");
}

// ------------------------------
//  GMAIL TRANSPORTER
// ------------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASS, // Google App Password
  },
});

// Verify connection
transporter.verify()
  .then(() => console.log("✅ Gmail SMTP connected successfully"))
  .catch((err) => console.error("❌ Gmail SMTP connection failed:", err.message));


// ------------------------------
//  CONTACT FORM ROUTE
// ------------------------------
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Missing name, email or message",
    });
  }

  const adminEmail = GMAIL_USER;

  const mailToAdmin = {
    from: `"${name}" <${adminEmail}>`,
    to: adminEmail,
    subject: `New Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    replyTo: email,
  };

  const mailToUser = {
    from: `"Rabnex Innovations" <${adminEmail}>`,
    to: email,
    subject: `Thanks for contacting Rabnex, ${name}!`,
    text: `Hi ${name},

Thank you for contacting Rabnex Innovations.

We received your message:
"${message}"

We will reply soon.

— Rabnex Team`,
  };

  try {
    await transporter.sendMail(mailToAdmin);
    await transporter.sendMail(mailToUser);

    res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    res.status(500).json({ success: false, message: "Failed to send message." });
  }
});

// ------------------------------
//  SERVER START
// ------------------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
