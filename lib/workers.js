exports.startAddingGifs = function (db) {
    var async = require('async'),
        util = require('./util'),
        urlFetcher = require('./workers/url-fetcher'),
        downloader = require('./workers/downloader'),
        channel = require('./channel');
    channel.db = db;
    async.forever(
        function(next) {
            var source, sources = ['giphy', 'ds106', 'catapi', 'giffyco'];
            if (db.config.imgur.client_id) {
                sources.push('imgur');
            }
            source = sources[Math.floor(Math.random()*sources.length)];
            async.waterfall([
                function (cb) {
                    urlFetcher(channel, source, cb);
                },
                function (cb) {
                    util.getFirstJSONFromTemp(db.getDbPath(), cb);
                },
                function (row, cb) {
                    downloader(channel, row, cb);
                }
            ],
            function(err, result) {
                if (err) {
                    channel.failureFetchChannel(result._id, function (err) {
                        if (err) console.log('fail fetch channel error', err);
                        next();
                    });
                } else {
                    channel.successFetchChannel(result._id, function (err) {
                       if (err) console.log('success fetch channel error', err);
                       next();
                    });
                };
            });
        },
        function(err) {
            console.log('fatal - worker execution halted on error', err);
        }
    );
};

exports.addGif = function (db, source, callback) {
    var async = require('async'),
        util = require('../util'),
        urlFetcher = require('./workers/url-fetcher'),
        downloader = require('./workers/downloader'),
        channel = require('./channel');
    channel.db = db;
    async.waterfall([
        function (cb) {
            urlFetcher(channel, source, cb);
        },
        function (cb) {
            util.getFirstJSONFromTemp(db.getDbPath(), cb);
        },
        function (row, cb) {
            downloader(channel, row, cb);
        }
    ],
    function(err, result) {
        callback(err, result);
    });
};