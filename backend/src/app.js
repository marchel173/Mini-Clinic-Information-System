const express = require("express");
const cors = require("cors");
require("dotenv").config();

const routes = require("./routes");
const { errorHandler, notFound } = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) =>
  res.json({ success: true, message: "API is running" }),
);

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
