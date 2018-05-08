var express = require('express');
var bodyParser = require('body-parser');
var logger = require("morgan");
var mongoose = require("mongoose");
    //routeValidator = require('express-route-validator'),
    
var axios = require("axios");
var cheerio = require("cheerio");

// require all models
var db = require("./models");

// Heroku doesn't always run off the local port
var PORT = process.env.PORT || 5000;

// initialize express
var app = express();

// morgan logger will log requests
app.use(logger("dev"));
// express will handle data parsing (form submission)
app.use(bodyParser.urlencoded({ extended: true }));
// use express.static to serve the public folder
app.use(express.static("public"));

// set up routing js files
//require("./routes/api-routes.js")(app);
//require("./routes/html-routes.js")(app);
//var friendList = require("./data/friends.js");

// if deployed connect to deployed DB, otherwise connect to Mongo DB
var MONGODB_URI = (process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines");

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// sull favicon route
app.get("/skull", function(req, res) {
    res.sendFile(path.join(__dirname, "../images/skull.ico"));
});

// A GET route for scraping the echoJS website
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with request
    axios.get("http://www.echojs.com/").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $("article h2").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, send it to the client
                    return res.json(err);
                });
        });

        // If we were able to successfully scrape and save an Article, send a message to the client
        res.send("Scrape Complete");
    });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // get every article in the Articles collection
    db.Article.find({}).then(function (dbArticle) {
        res.json(dbArticle);
    })
        .catch(function (err) {
            // if error send to client
            res.json(err);
        });
});



// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    // TODO
    // ====
    // Finish the route so it finds one article using the req.params.id,
    // and run the populate method with "note",
    // then responds with the article with the note included
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        }).catch(function (err) {
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // TODO
    // ====
    // save the new note that gets posted to the Notes collection
    // then find an article from the req.params.id
    // and update it's "note" property with the _id of the new note
    db.Note.create(req.body).then(function (dbNotes) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbNote._id } }, { new: true })
    }).then(function (newNote) {
        res.json(newNote);
    });
});

// Starts the server to begin listening
app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT + "!");
});

