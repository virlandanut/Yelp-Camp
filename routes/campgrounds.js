const express = require("express");
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const { campgroundSchema } = require("../schemas");
const ExpressError = require("../utils/ExpressError");

const router = express.Router();

const validateCampground = (request, response, next) => {
  const { error } = campgroundSchema.validate(request.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.get(
  "/",
  catchAsync(async (request, response) => {
    const campgrounds = await Campground.find({});
    response.render("campgrounds/index", { campgrounds });
  })
);

router.get(
  "/new",
  catchAsync(async (request, response) => {
    response.render("campgrounds/new");
  })
);

router.post(
  "/",
  validateCampground,
  catchAsync(async (request, response, next) => {
    const { campground } = request.body;
    const camp = new Campground(campground);
    await camp.save();
    response.redirect(`/campgrounds/${camp._id}`);
  })
);
router.get(
  "/:id",
  catchAsync(async (request, response) => {
    const { id } = request.params;
    const campground = await Campground.findById(id).populate("reviews");
    response.render("campgrounds/show", { campground });
  })
);

router.get(
  "/:id/edit",
  catchAsync(async (request, response) => {
    const { id } = request.params;
    const campground = await Campground.findByIdAndUpdate(id);
    response.render("campgrounds/edit", { campground });
  })
);

router.put(
  "/:id",
  validateCampground,
  catchAsync(async (request, response) => {
    const { id } = request.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...request.body.campground,
    });
    response.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:id",
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
