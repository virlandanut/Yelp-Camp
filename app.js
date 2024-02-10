/*
 * Importare și inițializare Express,
 * method-override și ExpressError
 */
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

/*
 * Conexiunea cu baza de date folosing mongoose.
 */
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/yelp-camp");
mongoose.set("strictQuery", true);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log("Conexiunea cu baza de date este reușită!");
});

const sessionConfig = {
  secret: "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/*
 * Middleware flash
 */

app.use((request, response, next) => {
  response.locals.currentUser = request.user;
  response.locals.success = request.flash("success");
  response.locals.error = request.flash("error");
  next();
});

/*
 * Setare Embeded JavaScript ca default
 * pentru randarea paginilor web.
 */
const ejsMate = require("ejs-mate");
const path = require("path");
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

/*
 * Importare rute separate
 */
const userRoutes = require("./routes/users");
const campgroundsRoutes = require("./routes/campgrounds");
const reviewsRouters = require("./routes/reviews");
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRouters);
app.use("/", userRoutes);

app.get("/", (request, response) => {
  response.render("home");
});

app.all("*", (request, response, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((error, request, response, next) => {
  const { statusCode = 500, message = "Something went wrong..." } = error;
  response.status(statusCode).send(message);
});

app.listen(3000, () => {
  console.log("Portul 3000 este activ.");
});
