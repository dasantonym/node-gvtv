// returns random gif from imgur.com

var pageIndex = 0,
    maxPages = 50,
    baseUrl = 'https://api.imgur.com/3/gallery/random/random/';

exports.config = null;

exports.get = function (callback) {
    var request = require('request'),
        async = require('async');

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
                request.get(options, function (err, res, body) {
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
                        setCache(options.url, { created: new Date().getTime(), ttl: 3600, data: animated }, cb);
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
                setCache(options.url, cacheData, function (err) {
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

function getCache(url, callback) {
    var async = require('async'),
        path = require('path'),
        fs = require('fs'),
        config = exports.config;
    async.waterfall([
        function (cb) {
            var cachePath = path.join(config.imgur.cache_dir, getKey(url));
            fs.exists(cachePath, function (exists) {
                if (exists) {
                    //console.log('found in cache', cachePath);
                    cb(null, cachePath);
                } else {
                    //console.log('not in cache', cachePath);
                    cb(null, null);
                }
            });
        },
        function (cachePath, cb) {
            if (cachePath==null) return cb(null, null);
            //console.log('fetching from cache', cachePath);
            var resource = require('../resource');
            resource.getResource(cachePath, function (err, cacheEntry) {
                if (err) return cb(err, null);
                if ((new Date().getTime()-cacheEntry.created)*0.001>cacheEntry.ttl) {
                    //console.log('cache expired', cachePath);
                    cb(null, null);
                } else {
                    cb(null, cacheEntry);
                }
            });
        }
    ],
    function (err, cacheEntry) {
        callback(err, cacheEntry);
    });
}

function setCache(url, payload, callback) {
    var path = require('path'),
        config = exports.config;
    var cachePath = path.join(config.imgur.cache_dir, getKey(url));
    var resource = require('../resource');
    resource.setResource(cachePath, payload, function (err) {
        //console.log('set cache', cachePath);
        callback(err, payload);
    });
}

function getKey(url) {
    return url.replace(/\W+/g, '_');
}

function getNextPage(options, callback) {
    getCache(options.url, function (err, cacheData) {
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