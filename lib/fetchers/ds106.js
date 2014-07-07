// returns random gif from DS106
// http://johnjohnston.info/oddsandends/ds106gif/ds106gifapi.html

exports.config = null;

exports.get = function (callback) {
    var urlCache = require('../url-cache'),
        http = require('http'),
        async = require('async');

    var dataUrl = 'http://johnjohnston.info/oddsandends/ds106gif/?f=jsonp&c=100&callback=ds1064life';

    async.waterfall([
        function (cb) {
            urlCache.get(dataUrl, exports.config, cb);
        },
        function (cacheData, cb) {
            if (cacheData && cacheData.length > 0) {
                cb(null, cacheData);
            } else {
                http.get(dataUrl, function (res) {
                    var body = '';
                    res.on('data', function(chunk) {
                        body += chunk;
                    });
                    res.on('end', function() {
                        var jsonString = body.substring(body.indexOf('(') + 1, body.indexOf(')'));
                        try {
                            var result = JSON.parse(jsonString);
                        } catch (e) {
                            return cb(e, null);
                        }
                        if (result && result.length > 0) {
                            cb(null, result);
                        } else {
                            cb(new Error('ds106: no data'), null);
                        }
                    });
                }).on('error', function (err) {
                    cb(err, null);
                });
            }
        },
        function (cacheData, cb) {
            var selectedImage = cacheData.pop();
            urlCache.set(dataUrl, cacheData, exports.config, function (err) {
                cb(err, selectedImage.url);
            });
        }
    ],
    function (err, selectedImage) {
        callback(err, selectedImage, 'ds106');
    });

};
