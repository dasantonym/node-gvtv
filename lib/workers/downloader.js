module.exports = function (channel, row, callback) {

    var http = require('http'),
        path = require('path'),
        async = require('async'),
        fs = require('fs'),
        dbPath = channel.db.getDbPath();

    async.waterfall([
        function (cb) {
            if (!row || !row._id) return cb(new Error('no valid channel supplied'));
            cb(null, row._id);
        },
        channel.beginFetchChannel,
        function (row, cb) {
            if (row) {
                var file = fs.createWriteStream(path.resolve(dbPath, 'tmp', row._id+'.gif'));
                http.get(row.url, function (response) {
                    response.pipe(file);
                }).on('error', function (err) {
                    cb(err);
                });
                file.on('finish', function () {
                    fs.stat(path.resolve(dbPath, 'tmp', row._id+'.gif'), function (err, stats) {
                        if (err || stats.size==0) {
                            cb(err);
                        } else {
                            cb(err);
                        }
                    });
                });
                file.on('error', function (err) {
                    cb(err);
                });
            }
        }
    ],
    function (err) {
        callback(err, row);
    });
};
