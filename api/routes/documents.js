var app = require('../../server.js');
var document = require('../controllers/documents.js');

module.exports = function() {
    // app.get('/documents', document.list),
        app.post('/document', document.create)
    //     app.post('/documents/update', document.update),
    //     app.post('/documents/delete', document.delete)
};