'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Document = mongoose.model('Document'),
  request = require('request');



exports.create = function (req, res) {
    var document = {}
    var token = req.body.token;
    document.metadata = req.body.metadata;
    document.content = JSON.parse(req.body.content);
    // console.log(token);
    // console.log(document.metadata);
    // console.log(document.content);

    checkToken(token)
        .then(addDocument(document.metadata.id, document))
        .then(function (response) {
            // console.log(response.body);
            res.end();
        });

    //  add or update document
    function addDocument(query, document) {
        return new Promise(function (resolve, reject) {
            Document.findOneAndUpdate({ 'id': query }, document, { upsert: true, setDefaultsOnInsert: true }, function (err, doc) {
                if (err) {
                    reject(err);
                } else {
                    resolve(doc);
                }
            });
        });
    };
    res.end();
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