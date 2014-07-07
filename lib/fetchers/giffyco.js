// returns random gif from giffy.co

var pageIndex = 0,
    maxPages = 10,
    baseUrl = 'http://api.giffy.co/gifs/limit/100/offset/';

exports.config = null;

exports.get = function (callback) {
    var request = require('request'),
        async = require('async'),
        urlCache = require('../url-cache');

    pageIndex = 0;

    var options = {
        url: baseUrl + (pageIndex * 100).toString(),
        timeout: 10000
    };

    async.waterfall([
        function (cb) {
            getNextPage(options, cb);
        },
        function (cacheData, cb) {
            if (!cacheData) {
                request.get(options, function (err, res, body) {
                    if (err) {
                        return cb(err, null, 'giffyco');
                    }
                    var result;
                    try {
                        result = JSON.parse(body);
                    } catch (e) {
                        return cb(e, null, 'giffyco');
                    }
                    if (result.gifs && result.gifs.length > 0) {
                        urlCache.set(options.url, { created: new Date().getTime(), ttl: 3600, data: result.gifs }, exports.config, cb);
                    } else {
                       cb(new Error('giffyco: no data'));
                    }
                });
            } else {
                cb(null, cacheData);
            }
        },
        function (cacheData, cb) {
            if (cacheData.data && cacheData.data.length>0) {
                var selectedImage = cacheData.data.pop();
                urlCache.set(options.url, cacheData, exports.config, function (err) {
                    cb(err, selectedImage.url, 'giffyco');
                });
            } else {
                cb(new Error('giffyco: cache empty'), null, 'giffyco');
            }
        }
    ],
    function (err, selectedImage) {
        callback(err, selectedImage, 'giffyco');
    });
};

function getNextPage(options, callback) {
    var urlCache = require('../url-cache');
    urlCache.get(options.url, exports.config, function (err, cacheData) {
        if (err) return callback(err, null);
        if (!cacheData) {
            callback(null, null);
        } else if (cacheData.data && cacheData.data.length>0) {
            callback(null, cacheData);
        } else {
            pageIndex += 1;
            if (pageIndex < maxPages) {
                options.url = baseUrl + (pageIndex * 100).toString();
                setTimeout(function () {
                    getNextPage(options, callback);
                });
            } else {
                callback(new Error('giffyco: cache empty'), null, 'giffyco');
            }
        }
    });
}