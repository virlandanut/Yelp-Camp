const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const { campgroundSchema, reviewSchema } = require("./schemas");
const Review = require("./models/review");

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

const validateCampground = (request, response, next) => {
  const { error } = campgroundSchema.validate(request.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

const validateReview = (request, response, next) => {
  const { error } = reviewSchema.validate(request.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

app.get("/", (request, response) => {
  response.render("home");
});

app.get(
  "/campgrounds",
  catchAsync(async (request, response) => {
    const campgrounds = await Campground.find({});
    response.render("campgrounds/index", { campgrounds });
  })
);

app.get(
  "/campgrounds/new",
  catchAsync(async (request, response) => {
    response.render("campgrounds/new");
  })
);

app.post(
  "/campgrounds",
  validateCampground,
  catchAsync(async (request, response, next) => {
    const { campground } = request.body;
    const camp = new Campground(campground);
    await camp.save();
    response.redirect(`/campgrounds/${camp._id}`);
  })
);
app.get(
  "/campgrounds/:id",
  catchAsync(async (request, response) => {
    const { id } = request.params;
    const campground = await Campground.findById(id).populate("reviews");
    response.render("campgrounds/show", { campground });
  })
);

app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (request, response) => {
    const { id } = request.params;
    const campground = await Campground.findByIdAndUpdate(id);
    response.render("campgrounds/edit", { campground });
  })
);

app.put(
  "/campgrounds/:id",
  validateCampground,
  catchAsync(async (request, response) => {
    const { id } = request.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...request.body.campground,
    });
    response.redirect(`/campgrounds/${campground._id}`);
  })
);

app.delete(
  "/campgrounds/:id",
  catchAsync(async (request, response) => {
    try {
      const { id } = request.params;
      await Campground.findByIdAndDelete(id);
      response.redirect("/campgrounds");
    } catch (error) {
      console.log(error);
    }
  })
);

app.post(
  "/campgrounds/:id/reviews",
  validateReview,
  catchAsync(async (request, response) => {
    const campground = await Campground.findById(request.params.id);
    const review = new Review(request.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    response.redirect(`/campgrounds/${campground._id}`);
  })
);

app.delete(
  "/campgrounds/:id/reviews/:reviewId",
  catchAsync(async (request, response) => {
    const { id, reviewId } = request.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    response.redirect(`/campgrounds/${id}`);
  })
);

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
