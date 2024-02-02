const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");

router.get("/register", (request, response) => {
  response.render("users/register");
});

router.post(
  "/register",
  catchAsync(async (request, response) => {
    try {
      const { username, email, password } = request.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      console.log(registeredUser);
      request.flash("success", "Welcome to Yelp Camp!");
      response.redirect("/campgrounds");
    } catch (error) {
      request.flash("error", error.message);
      response.redirect("/register");
    }
  })
);

router.get("/login", (request, response) => {
  response.render("users/login");
});
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (request, response) => {
    request.flash("success", "Bine ai revenit!");
    response.redirect("/campgrounds");
  }
);

module.exports = router;
