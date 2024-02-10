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
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 30) + 10;
    const camp = new Campground({
      author: "65c7499df0b19c7322da3886",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: "https://source.unsplash.com/collection/483251",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio dolorem iste, consequuntur autem similique nesciunt eveniet perspiciatis doloribus quam possimus sed odit eaque itaque? Modi aliquam laboriosam inventore error autem?",
      price: price,
    });
    await camp.save();
  }
};

seedDb().then(() => {
  mongoose.connection.close();
});
