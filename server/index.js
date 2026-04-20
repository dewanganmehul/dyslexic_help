require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors({
  origin: ["http://localhost:5173",
  "https://dyslexic-help.vercel.app"
]
}));

app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const tutorRoutes = require("./routes/tutorRoutes");
const companionRoutes = require("./routes/companionRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/companion", companionRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});