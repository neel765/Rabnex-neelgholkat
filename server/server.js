const express = require("express");
const cors = require("cors");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();

app.use(cors());
app.use(express.json());

// ✅ ROOT CHECK
app.get("/", (req, res) => {
  res.send("✅ Server running with Resend Email API");
});

// ✅ CONTACT API (FREE, NO SMTP)
app.post("/send", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rabnex <onboarding@resend.dev>",
        to: ["rabnexinnovation@gmail.com"],
        subject: `New Message from ${name}`,
        html: `
          <h2>New Contact Message</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Message:</b> ${message}</p>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("❌ Resend Error:", err);
      return res.status(500).json({ success: false, message: "Email API failed" });
    }

    res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });

  } catch (error) {
    console.error("❌ API Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ✅ RENDER DYNAMIC PORT
const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
