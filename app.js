require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3107;

app.use(
  cors({
    origin: "https://teater.arkiva.gov.al",
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
app.options("/submit", cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://teater.arkiva.gov.al");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("This is working");
});

app.post("/submit", async (req, res) => {
  const { film, name, email, persona } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Rezervim Kinema Verore" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: `${film}`,
      text: `Përshëndetje ${name},\n\nJu konfirmojmë rezervimin tuaj për të ndjekur ${film}.\nNumri i biletave të rezervuara: ${persona}.\n\nJu mirëpresim!`,
    });

    await transporter.sendMail({
      from: `"Rezervim Kinema Verore" <${process.env.FROM_EMAIL}>`,
      to: process.env.FROM_EMAIL,
      subject: `${film} - ${name} - ${persona}`,
      text: `Rezervim i ri:\n\nFilmi: ${film}\n\nEmri: ${name}\nEmail: ${email}\nNr.personave: ${persona}`,
    });

    res.status(200).send("✅ Emails sent");
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    res.status(500).send("Failed to send email");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
