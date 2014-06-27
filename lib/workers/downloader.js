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
            if (!row || !row._id) {
                cb('unfetched channel result null');
                return;
            }
            cb(null, row._id);
        },
        channel.beginFetchChannel,
        function (row, cb) {
            if (row) {
                var file = fs.createWriteStream(path.resolve(dbPath, 'tmp', row._id+'.gif'));
                http.get(row.url, function (response) {
                    response.pipe(file);
                }).on('error', function(err) {
                    console.log('file download error', err);
                    channel.failureFetchChannel(row._id, function (err) {
                        cb(err);
                    });
                });
                file.on('finish', function () {
                    fs.stat(path.resolve(dbPath, 'tmp', row._id+'.gif'), function (err, stats) {
                        if (err || stats.size==0) {
                            channel.failureFetchChannel(row._id, function (err) {
                                cb(err);
                            });
                        } else {
                            channel.successFetchChannel(row._id, function (err) {
                                cb(err);
                            });
                        }
                    });
                });
                file.on('error', function (err) {
                    console.log("error fetching: "+row.url+" error: "+err);
                    channel.failureFetchChannel(row._id, function (err) {
                        cb(err);
                    });
                });
            }
        }
    ],
    function (err) {
        callback(err);
    });
};
