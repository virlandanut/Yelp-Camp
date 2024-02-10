const { campgroundSchema, reviewSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");

module.exports.isLoggedIn = (request, response, next) => {
  if (!request.isAuthenticated()) {
    request.session.returnTo = request.originalUrl;
    request.flash(
      "error",
      "Trebuie să fii autentificat pentru a accesa această pagină!"
    );
    response.redirect("/login");
  }
  next();
};

module.exports.storeReturnTo = (request, response, next) => {
  if (request.session.returnTo) {
    response.locals.returnTo = request.session.returnTo;
  }
  next();
};

module.exports.validateCampground = (request, response, next) => {
  const { error } = campgroundSchema.validate(request.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (request, response, next) => {
  const { id } = request.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(request.user._id)) {
    request.flash("error", "Nu ai permisiune să faci asta!");
    return response.redirect(`/campgrounds/${id}`);
  } else {
    next();
  }
};

module.exports.validateReview = (request, response, next) => {
  const { error } = reviewSchema.validate(request.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (request, response, next) => {
  const { id, reviewId } = request.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(request.user._id)) {
    request.flash("error", "Nu ai permisiune să faci asta!");
    return response.redirect(`/campgrounds/${id}`);
  } else {
    next();
  }
};
