// returns random gif from imgur.com

exports.config = null;

exports.get = function (callback) {
    var request = require('request'),
        async = require('async');

    var options = {
        url: 'https://api.imgur.com/3/gallery/random/random/'+Math.round(Math.random()*50).toString(),
        timeout: 10000,
        headers: {
            'User-Agent': 'GVTV via node-request',
            'Authorization': 'Client-ID '+exports.config.imgur.client_id
        }
    };

    async.waterfall([
        function (cb) {
            getCache(options.url, function (err, cacheData) {
                if (err) return cb(err);
                cb(null, cacheData);
            });
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
                    setCache(options.url, result, cb);
                });
            } else {
                cb(null, cacheData);
            }
        },
        function (cacheData, cb) {
            var selectedImage = null,
                counter = 0;
            while (selectedImage == null && counter < 50) {
                var randIndex = Math.round(Math.random()*cacheData.data.length-1);
                if (cacheData && cacheData.data && cacheData.data[randIndex] && cacheData.data[randIndex].animated) {
                    selectedImage = cacheData.data[randIndex];
                }
                counter+=1;
            }
            if (selectedImage) {
                cb(null, selectedImage.link, 'imgur');
            } else {
                cb(new Error('no image found: imgur'));
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
            fs.stat(cachePath, function (err, stats) {
                if (err) return cb(err, null);
                if ((new Date().getTime()-stats.mtime.getTime())*0.001>3600) {
                    //console.log('cache expired', cachePath);
                    cb(null, null);
                } else {
                    cb(null, cachePath);
                }
            });
        },
        function (cachePath, cb) {
            if (cachePath==null) return cb(null, null);
            //console.log('fetching from cache', cachePath);
            var resource = require('../resource');
            resource.getResource(cachePath, cb);
        }
    ],
    function (err, cacheData) {
        callback(err, cacheData);
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