const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Gmail transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rabnexinnovation@gmail.com", // your Gmail
    pass: "elvnmahkuaopzjsc", // your Google App Password
  },
});

// ✅ Verify connection
transporter
  .verify()
  .then(() => console.log("✅ Gmail SMTP connected successfully"))
  .catch((err) => console.error("❌ Connection failed:", err));

// ✅ Contact form endpoint
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  // ✅ Email sent to YOU (the admin)
  const mailOptions = {
    from: `"${name}" <rabnexinnovation@gmail.com>`, // sender = your business Gmail
    to: "rabnexinnovation@gmail.com", // your receiving email (admin)
    subject: `New Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    replyTo: email, // ✅ reply will go directly to the customer's email
  };

  // ✅ Auto reply to the customer
  const autoReply = {
    from: `"Rabnex Innovations" <rabnexinnovation@gmail.com>`,
    to: email,
    subject: `✅ Thanks for contacting Rabnex, ${name}!`,
    text: `Hi ${name},\n\nThank you for reaching out to us. We’ve received your message:\n\n"${message}"\n\nOur team will get back to you soon.\n\nBest,\nRabnex Team`,
  };

  try {
    // Send both emails
    await transporter.sendMail(mailOptions); // to you
    await transporter.sendMail(autoReply); // to customer
    console.log(`📧 Message received from ${name} <${email}>`);
    res.status(200).json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    res.status(500).json({ success: false, message: "Failed to send message." });
  }
});

const PORT = 4000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
