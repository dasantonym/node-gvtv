module.exports = function (channel, callback) {

    var http = require('http');
    var path = require('path');
    var async = require('async');
    var fs = require('fs');
    var util = require('../util');

    var dbPath = channel.db.getDbPath();

    async.waterfall([
        function (cb) {
            util.getFirstJSONFromTemp(dbPath, cb);
        },
        function (row, cb) {
            if (!row || !row._id) return cb(new Error('unfetched channel result null'));
            cb(null, row._id);
        },
        channel.beginFetchChannel,
        function (row, cb) {
            if (row) {
                var file = fs.createWriteStream(path.resolve(dbPath, 'tmp', row._id+'.gif'));
                http.get(row.url, function (response) {
                    response.pipe(file);
                }).on('error', function (err) {
                    cb(err, row);
                });
                file.on('finish', function () {
                    fs.stat(path.resolve(dbPath, 'tmp', row._id+'.gif'), function (err, stats) {
                        if (err || stats.size==0) {
                            cb(err, row);
                        } else {
                            cb(err, row);
                        }
                    });
                });
                file.on('error', function (err) {
                    cb(err, row);
                });
            }
        }
    ],
    function (err, result) {
        callback(err, result);
    });
};
