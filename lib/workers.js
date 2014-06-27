exports.startAddingGifs = function (db) {
    var async = require('async');
    var urlFetcher = require('./workers/url-fetcher');
    var downloader = require('./workers/downloader');
    async.forever(
        function(next) {
            var source = 'imgur';
            if (Math.random()<0.8) {
                source = 'giphy';
            }
            async.waterfall([
                function (cb) {
                    urlFetcher(db, source, cb);
                },
                function (cb) {
                    downloader(db, cb);
                }
            ],
            function(err) {
                if (err) {
                    console.log('add gif error', err);
                };
                next();
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
    function(err) {
        if (err) {
            console.log('add gif error', err);
        };
        callback(err);
    });
};