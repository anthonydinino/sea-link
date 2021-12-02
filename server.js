const express = require("express");
const cors = require("cors");

//using dotenv to store the mongouri
require("dotenv").config();

//connect to the database
require("./db");

//initilising the server to use json and serve a static page
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//add routes
const routerRouter = require("./routers/route");
const busRouter = require("./routers/bus");
const stopRouter = require("./routers/stop");
const lineRouter = require("./routers/line");
app.use("/api/bus", busRouter);
app.use("/api/stop", stopRouter);
app.use("/api/route", routerRouter);
app.use("/api/line", lineRouter);

//either use heroku port or port 3000
app.listen(process.env.PORT || 3000, () => {
  console.log("listening on port 3000");
});
