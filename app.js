const express = require("express");
const app = express();
const morgan = require("morgan");

app.use(express.json());

process.env.NODE_ENV === "development" && app.use(morgan("dev"));

////// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

const userRouter = require("./routes/userRoutes");

app.use("/api/v1/users", userRouter);

module.exports = app;
