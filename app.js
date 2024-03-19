/** BizTime express application. */


const express = require("express");

const app = express();
const ExpressError = require("./expressError")

app.use(express.json());

//connect to route pages 
const cRoutes = require("./routes/companies");
const iRoutes = require("./routes/invoices");
const indRoutes = require("./routes/industries");


//have app use the routes listed in those pages
app.use("/companies", cRoutes);
app.use("/invoices", iRoutes);
app.use("/industries", indRoutes);


/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  let status = err.status;
  let message = err.message;
  return res.json({
    error: { message, status }
  });
});

module.exports = app;
