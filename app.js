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

  console.log("📩 Incoming reservation:");
  console.log("Film:", film);
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Persona:", persona);

  try {
    console.log("🔑 Using SMTP settings:");
    console.log("HOST:", process.env.SMTP_HOST);
    console.log("PORT:", process.env.SMTP_PORT);
    console.log("SECURE:", process.env.SMTP_SECURE);
    console.log("USER:", process.env.SMTP_USER);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Rezervim Biblioteka Verore" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: `${film}`,
      text: `Pershendetje ${name}. Ju konfirmojme rezervimin tuaj per te ndjekur ${film}. Numri i biletave te rezervuara eshte: ${persona}.`,
    });

    console.log("✅ Email sent:", info.response);
    res.status(200).send("Email sent: " + info.response);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    res.status(500).send("Failed to send email");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
