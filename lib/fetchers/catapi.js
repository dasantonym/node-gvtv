// returns random gif from the CatAPI
// http://thecatapi.com/

exports.get = function (callback) {
    var http = require('http'),
        url = require('url');
    http.get('http://thecatapi.com/api/images/get?format=src&type=gif', function (res) {
        if (res.statusCode > 300 && res.statusCode < 400 && res.headers.location) {
            if (url.parse(res.headers.location).hostname) {
                callback(null, res.headers.location, 'catapi');
            } else {
                callback(new Error('catapi: hostname missing from redirect'), null, 'catapi');
            }
        } else {
            callback(new Error('catapi: endpoint did not redirect'), null, 'catapi');
        }
    });
};
