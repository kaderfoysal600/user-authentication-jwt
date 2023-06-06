const express = require("express");
const app = express();
const mongoose = require("mongoose");
const authRouter = require("./routes/auth");
const cors = require("cors");
app.use(cors());
const mongoURl = "mongodb://0.0.0.0:27017/loginData";
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);
mongoose.connect(mongoURl);
mongoose.connection.on("open", () => {
  console.log("Database connected successfully");
});

app.listen(3000, (err) => {
  if (!err) {
    console.log("App is listening .....");
  }
});
