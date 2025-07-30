const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3107;

app.use(
  cors({
    origin: [process.env.ALLOWED_ORIGIN],
    methods: ["POST"],
    allowedHeaders: ["Content-Type"],
  })
);
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

    const info = await transporter.sendMail({
      from: `"Rezervim Biblioteka Verore" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: `${film}`,
      text: `Pershendetje ${name}. Ju konfirmojme rezervimin tuaj per te ndjekur ${film}. Numri i biletave te rezervuara eshte: ${persona}.`,
    });

    res.status(200).send("Email sent: " + info.response);
  } catch (error) {
    console.error("Failed to send email:", error);
    res.status(500).send("Failed to send email");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
