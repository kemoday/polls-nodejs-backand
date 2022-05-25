const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "https://kemoday.github.io/");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

//defining other routes

app.use("/polls/", require("./routes/polls.route"));
app.use("/user/account/", require("./routes/users.route"));

const url = process.env.MONGODB_URL || process.env.CSTR;

mongoose
  .connect(url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("connection to MongoDB is started!");
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, "0.0.0.0", () =>
      console.log(`server is runing on port:${PORT}`)
    );
  })
  .catch((e) => {
    console.log("error while connecting to MongoDB");
  });
