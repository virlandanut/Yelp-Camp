const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

mongoose.connect("mongodb://localhost:27017/yelp-camp");
mongoose.set("strictQuery", true);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Eroare conexiune: "));

db.once("open", () => {
  console.log("Conexiunea cu baza de date este reușită!");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDb = async () => {
  await Campground.deleteMany({});
};

seedDb().then(() => {
  mongoose.connection.close();
});
