exports.get = function (url, config, callback) {
    var async = require('async'),
        path = require('path'),
        fs = require('fs');
    async.waterfall([
        function (cb) {
            var cachePath = path.join(config.url_cache_dir, getKey(url));
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
            var resource = require('./resource');
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
};

exports.set = function (url, payload, config, callback) {
    var path = require('path'),
        cachePath = path.join(config.url_cache_dir, getKey(url)),
        resource = require('./resource');
    resource.setResource(cachePath, payload, function (err) {
        //console.log('set cache', cachePath);
        callback(err, payload);
    });
}

function getKey(url) {
    return url.replace(/\W+/g, '_');
}