const express = require("express");
const cors = require("cors");
const path = require("path")
const hbs = require('hbs');
const wax = require('wax-on');
// read the variables form the .env file
// and save it to process.env
require('dotenv').config()

const app = express();

const corsOptions = {
  origin: "http://localhost:8080"
};

app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(express.json());

wax.setLayoutPath('./views/layouts');
wax.on(hbs.handlebars);
app.set('view engine', 'hbs');
hbs.registerHelper('date', (currentDate, pattern) => {
  if (currentDate) {
      return new Date(currentDate).toISOString().split('T')[0]
  } else {
      return '';
  }
})

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// To serve static files such as images, CSS files, and JavaScript files, use the express.static built-in middleware function in Express.
// app.use(express.static('public'))
app.use(express.static(path.join(__dirname, 'public'), {
  index: false,
  addPoints: false,
  // about: false
}));

const db = require("./sever/models");

db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });


require("./sever/routes/index.route.js")(app)
require("./sever/routes/waterCoolerPoints.route.js")(app);
// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});