// returns random gif from imgur.com

var pageIndex = 0,
    maxPages = 50,
    baseUrl = 'https://api.imgur.com/3/gallery/random/random/';

exports.config = null;

exports.get = function (callback) {
    var request = require('request'),
        async = require('async'),
        urlCache = require('../url-cache');

    pageIndex = 0;

    var options = {
        url: baseUrl+pageIndex.toString(),
        timeout: 10000,
        headers: {
            'User-Agent': 'GVTV via node-request',
            'Authorization': 'Client-ID '+exports.config.imgur.client_id
        }
    };

    async.waterfall([
        function (cb) {
            getNextPage(options, cb);
        },
        function (cacheData, cb) {
            if (!cacheData) {
                request.get(options, exports.config, function (err, res, body) {
                    if (err) {
                        return cb(err, null, 'imgur');
                    }
                    var result;
                    try {
                        result = JSON.parse(body);
                    } catch (e) {
                        return cb(e);
                    }
                    if (result.data) {
                        var animated = [];
                        for (var i in result.data) {
                            if (result.data[i].animated) {
                                animated.push(result.data[i]);
                            }
                        }
                        urlCache.set(options.url, { created: new Date().getTime(), ttl: 3600, data: animated }, exports.config, cb);
                    } else {
                       cb(new Error('imgur: no data'));
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
                    cb(err, selectedImage.link, 'imgur');
                });
            } else {
                cb(new Error('imgur: cache empty'), null, 'imgur');
            }
        }
    ],
    function (err, selectedImage) {
        callback(err, selectedImage, 'imgur');
    });
};

function getNextPage(options, callback) {
    var urlCache = require('../url-cache');
    urlCache.get(options.url, exports.config, function (err, cacheData) {
        if (err) return cb(err);
        if (!cacheData) {
            callback(null, null);
        } else if (cacheData.data && cacheData.data.length>0) {
            callback(null, cacheData);
        } else {
            pageIndex += 1;
            if (pageIndex < maxPages) {
                options.url = baseUrl+pageIndex.toString();
                setTimeout(function () {
                    getNextPage(options, callback);
                });
            } else {
                callback(new Error('imgur: cache empty'), null, 'imgur');
            }
        }
    });
}