require("dotenv").config();

const express = require("express");

//express app
const app = express();

//routes
app.get("/", (req, res) => {
  res.json({ mssg: "Hello World" });
});

//listen for requests
app.listen(process.env.PORT, () => {
  console.log("listening for requests on", process.env.PORT);
});
