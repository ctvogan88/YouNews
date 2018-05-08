/* var express = require('express');
var path = require('path');

// set up express app
var app = express();

console.log('html routes in');

module.exports = function (app) {

    // favicon route
    app.get('/skull', function (req, res) {
        res.sendFile(path.join(__dirname, '../img/icons/skull.ico'));
    });

    app.get("/", function (req, res) {
        res.render("./public/index.html");
        // res.sendFile(path.join(__dirname, "../public/blog.html"));
      });
} */