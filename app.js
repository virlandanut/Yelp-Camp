const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const campgroundsRoutes = require("./routes/campgrounds");
const reviewsRouters = require("./routes/reviews");

mongoose.connect("mongodb://localhost:27017/yelp-camp");
mongoose.set("strictQuery", true);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log("Conexiunea cu baza de date este reușită!");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRouters);

app.get("/", (request, response) => {
  response.render("home");
});

app.all("*", (request, response, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((error, request, response, next) => {
  const { statusCode = 500, message = "Something went wrong..." } = error;
  response.status(statusCode).send(message);
  response.send("Something went wrong...");
});

app.listen(3000, () => {
  console.log("Portul 3000 este activ.");
});
