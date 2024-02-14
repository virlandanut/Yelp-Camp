const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const { storeReturnTo } = require("../middleware");

router.get("/register", (request, response) => {
  response.render("users/register");
});

router.post(
  "/register",
  catchAsync(async (request, response, next) => {
    try {
      const { username, email, password } = request.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      request.login(registeredUser, (error) => {
        if (error) {
          return next(error);
        }
        request.flash("success", "Welcome to Yelp Camp!");
        response.redirect("/campgrounds");
      });
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
  storeReturnTo,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (request, response) => {
    request.flash("success", "Bine ai revenit!");
    const redirectUrl = response.locals.returnTo || "/campgrounds";
    delete request.session.returnTo;
    response.redirect(redirectUrl);
  }
);

router.get("/logout", (request, response) => {
  request.logout((error) => {
    if (error) {
      return next(error);
    }
    request.flash("success", "Goodbye!");
    response.redirect("/login");
  });
});

module.exports = router;
