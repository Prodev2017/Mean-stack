'use strict';

var request = require('request'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');


exports.user = function (req, res) {
    // console.log(req.body);
    var token = req.body.token;
    var user = req.body.user;

    checkToken(token)
        .then(addUser(user.id, user))
        .then(function (response) {
            // console.log(response.body);
            res.end();
        })

    //  add or update user
    function addUser(query, user) {
        return new Promise(function (resolve, reject) {
            User.findOneAndUpdate({ 'id': query }, user, { upsert: true, setDefaultsOnInsert: true }, function (err, doc) {
                if (err) {
                    reject(err);
                } else {
                    resolve(doc);
                }
            });
        });
    };

    // res.end();
};

//check token
function checkToken(token) {
    return new Promise(function (resolve, reject) {
        request('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + token, function (error, response, body) {
            if (!error) {
                resolve(response);
            }
            else {
                reject(error);
            }
        })
    })
}