var app = require('../../server.js');
var user = require('../controllers/users.js').user;

module.exports = function () {
  app.post('/user', user)
};