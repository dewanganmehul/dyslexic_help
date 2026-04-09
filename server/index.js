const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const sessionRoutes = require("./routes/sessionRoutes");

app.use("/api/sessions", sessionRoutes);

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());

require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("DyslexiCore API running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});