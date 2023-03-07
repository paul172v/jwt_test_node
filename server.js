require("dotenv").config({ path: "./config.env" });
const mongoose = require("mongoose");
const app = require("./app");

const db = process.env.DB_URL.replace("<PASSWORD>", process.env.DB_PASSWORD);
mongoose.set("strictQuery", true);
mongoose.connect(db).then(console.log("Connected to database"));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port... ${port}`);
});
