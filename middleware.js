const req = require("express/lib/request");

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
