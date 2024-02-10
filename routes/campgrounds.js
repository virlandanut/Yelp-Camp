const express = require("express");
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

const router = express.Router();

router.get(
  "/",
  catchAsync(async (request, response) => {
    const campgrounds = await Campground.find({});
    response.render("campgrounds/index", { campgrounds });
  })
);

router.get(
  "/new",
  isLoggedIn,
  catchAsync(async (request, response) => {
    response.render("campgrounds/new");
  })
);

router.post(
  "/",
  isLoggedIn,
  validateCampground,
  catchAsync(async (request, response, next) => {
    const { campground } = request.body;
    const camp = new Campground(campground);
    camp.author = request.user._id;
    await camp.save();
    request.flash("success", "Locul de campat a fost creat cu success!");
    response.redirect(`/campgrounds/${camp._id}`);
  })
);
router.get(
  "/:id",
  catchAsync(async (request, response) => {
    const { id } = request.params;
    const campground = await Campground.findById(id)
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("author");
    if (!campground) {
      request.flash("error", "Locul pe care doriți să-l accesați nu există!");
      response.redirect("/campgrounds");
    }
    response.render("campgrounds/show", { campground });
  })
);

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(async (request, response) => {
    const { id } = request.params;
    const campground = await Campground.findById(id);
    if (!campground) {
      request.flash("error", "Locul pe care doriți să-l editați nu există!");
      response.redirect("/campgrounds");
    }
    response.render("campgrounds/edit", { campground });
  })
);

router.put(
  "/:id",
  validateCampground,
  isLoggedIn,
  isAuthor,
  catchAsync(async (request, response) => {
    const { id } = request.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...request.body.campground,
    });
    request.flash("success", "Locul de campat a fost actualizat cu succes!");
    response.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
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

module.exports = router;
