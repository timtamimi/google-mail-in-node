var express = require('express');
require('dotenv').config();
var port = 8999;

var flash = require('connect-flash');

var express = require("express");

var request = require('request');

var session = require("express-session");

var app = express();

var bodyParser = require('body-parser')

var path = require('path');

app.use('/public', express.static(__dirname + '/public'));

app.use(flash());
	app.use(session({secret: 'keyboard cat'}))
	app.use(bodyParser());
	app.set('view engine', 'pug');
	app.set('view options', { layout: false });


require('./lib/routes.js')(app);

app.listen(port);
console.log('Node listening on port %s', port);
