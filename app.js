const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

//Conexiune cu baza de date
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

app.get("/", (request, response) => {
  response.render("home");
});

app.get("/campgrounds", async (request, response) => {
  const campgrounds = await Campground.find({});
  response.render("campgrounds/index", { campgrounds });
});

app.get("/campgrounds/new", async (request, response) => {
  response.render("campgrounds/new");
});

app.post("/campgrounds", async (request, response) => {
  const { campground } = request.body;
  const camp = new Campground(campground);
  await camp.save();
  response.redirect(`/campgrounds/${camp._id}`);
});
app.get("/campgrounds/:id", async (request, response) => {
  const { id } = request.params;
  const campground = await Campground.findById(id);
  response.render("campgrounds/show", { campground });
});

app.get("/campgrounds/:id/edit", async (request, response) => {
  const { id } = request.params;
  const campground = await Campground.findByIdAndUpdate(id);
  response.render("campgrounds/edit", { campground });
});

app.put("/campgrounds/:id", async (request, response) => {
  const { id } = request.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...request.body.campground,
  });
  response.redirect(`/campgrounds/${campground._id}`);
});

app.delete("/campgrounds/:id", async (request, response) => {
  try {
    const { id } = request.params;
    await Campground.findByIdAndDelete(id);
    response.redirect("/campgrounds");
  } catch (error) {
    console.log(error);
  }
});

app.listen(3000, () => {
  console.log("Portul 3000 este activ.");
});
