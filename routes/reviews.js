const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const Review = require("../models/review");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

router.post(
  "/",
  isLoggedIn,
  validateReview,
  catchAsync(async (request, response) => {
    const campground = await Campground.findById(request.params.id);
    const review = new Review(request.body.review);
    review.author = request.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    request.flash("success", "Review-ul a fost adăugat cu success!");
    response.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(async (request, response) => {
    const { id, reviewId } = request.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    request.flash("success", "Review-ul a fost șters cu success!");
    response.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
