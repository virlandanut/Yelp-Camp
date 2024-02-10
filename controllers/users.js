const User = require("../models/user");

module.exports.renderRegister = (request, response) => {
  response.render("users/register");
};

module.exports.register = async (request, response, next) => {
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
};

module.exports.renderLogin = (request, response) => {
  response.render("users/login");
};

module.exports.login = (request, response) => {
  request.flash("success", "Bine ai revenit!");
  const redirectUrl = response.locals.returnTo || "/campgrounds";
  delete request.session.returnTo;
  response.redirect(redirectUrl);
};

module.exports.logout = (request, response) => {
  request.logout((error) => {
    if (error) {
      return next(error);
    }
    request.flash("success", "Goodbye!");
    response.redirect("/login");
  });
};
