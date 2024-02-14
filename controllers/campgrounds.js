const Campground = require("../models/campground");

module.exports.index = async (request, response) => {
  const campgrounds = await Campground.find({});
  response.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = async (request, response) => {
  response.render("campgrounds/new");
};

module.exports.createCampground = async (request, response, next) => {
  const campground = new Campground(request.body.campground);
  campground.images = request.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = request.user._id;
  await campground.save();
  console.log(campground);
  request.flash("success", "Successfully made a new campground!");
  response.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (request, response) => {
  const { id } = request.params;
  const campground = await Campground.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  if (!campground) {
    request.flash("error", "Locul pe care doriți să-l accesați nu există!");
    response.redirect("/campgrounds");
  }
  response.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (request, response) => {
  const { id } = request.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    request.flash("error", "Locul pe care doriți să-l editați nu există!");
    response.redirect("/campgrounds");
  }
  response.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (request, response) => {
  const { id } = request.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...request.body.campground,
  });
  request.flash("success", "Locul de campat a fost actualizat cu succes!");
  response.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (request, response) => {
  try {
    const { id } = request.params;
    await Campground.findByIdAndDelete(id);
    response.redirect("/campgrounds");
  } catch (error) {
    console.log(error);
  }
};
