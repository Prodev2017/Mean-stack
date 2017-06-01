'use strict';
var express = require('express');
var compress = require('compression');
var bodyParser = require('body-parser');
var cors = require('cors');


var port = process.env.PORT || 3020;

// mongodb
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/docsx');
require('./api/models/user.js');
require('./api/models/document.js');

var app = express();
module.exports = app;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compress());
app.set('indexFolder', '/dist');
if (process.env.env == 'dev')
  app.set('indexFolder', '/.tmp/dist');
app.use('/', express.static(__dirname + app.get('indexFolder')));
app.use(express.static('/'));
app.use('/node_modules', express.static(__dirname + '/node_modules', { maxAge: '1y' }));
app.use('/bower_components', express.static(__dirname + '/bower_components'));


require('./api/routes/users.js')();
require('./api/routes/documents.js')();

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, function () { console.log('Listening ' + port) });
