exports.startAddingGifs = function (db) {
    var async = require('async');
    var urlFetcher = require('./workers/url-fetcher');
    var downloader = require('./workers/downloader');
    var channel = require('./channel');
    channel.db = db;
    async.forever(
        function(next) {
            var source = 'imgur';
            if (Math.random()<0.5) {
                source = 'giphy';
            }
            async.waterfall([
                function (cb) {
                    urlFetcher(channel, source, cb);
                },
                function (cb) {
                    downloader(channel, cb);
                }
            ],
            function(err, result) {
                if (err) {
                    channel.db.failureFetchChannel(result._id, function (err) {
                        if (err) console.log('fail fetch channel error', err);
                        next();
                    });
                } else {
                    channel.db.successFetchChannel(result._id, function (err) {
                       if (err) console.log('fail fetch channel error', err);
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
    var async = require('async');
    var urlFetcher = require('./workers/url-fetcher');
    var downloader = require('./workers/downloader');
    var channel = require('./channel');
    channel.db = db;
    async.waterfall([
        function (cb) {
            urlFetcher(channel, source, cb);
        },
        function (cb) {
            downloader(channel, cb);
        }
    ],
    function(err, result) {
        callback(err, result);
    });
};