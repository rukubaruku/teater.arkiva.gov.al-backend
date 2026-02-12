require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const connectDB = require("./config/database");

const userRoutes = require("./routes/userRoute");
const movieRoutes = require("./routes/movieRoutes");
const reservationRoutes = require("./routes/reservationRoutes");

connectDB();

const corsOptions = {
  origin: "https://teater.arkiva.gov.al",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

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

app.use("/api", userRoutes);
app.use("/api", movieRoutes);
app.use("/api", reservationRoutes);

const PORT = process.env.PORT || 3107;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
