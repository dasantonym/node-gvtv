var config;
exports.initDb = function (externalConfig, callback) {
    var async = require('async');
    var fs = require('fs');
    var path = require('path');
    var resource = require('./resource');
    config = externalConfig;
    exports.config = externalConfig;
    var dbPath = exports.getDbPath();
    fs.exists(dbPath, function (exists) {
        if (!exists) {
            async.waterfall([
                function (cb) {
                    fs.mkdir(dbPath, cb);
                },
                function (cb) {
                    fs.mkdir(path.resolve(dbPath, 'channels'), cb);
                },
                function (cb) {
                    fs.mkdir(path.resolve(dbPath, 'tmp'), cb);
                },
                function (cb) {
                    fs.mkdir(path.resolve(dbPath, 'gif'), cb);
                },
                function (cb) {
                    resource.setResource(path.resolve(dbPath, 'available.json'), 0, cb);
                },
                function (available, cb) {
                    resource.setResource(path.resolve(dbPath, 'pointer.json'), 0, cb);
                }
            ],
            function (err) {
                callback(err);
            });
        } else {
            async.series([
                function (cb) {
                    var util = require('./util');
                    util.cleanTempDir(dbPath, cb);
                }
            ],
            function (err) {
                if (err) {
                    callback(err);
                    return;
                }
                callback();
            });
        }
    });
};

exports.getDbPath = function () {
    return config.dbPath;
};



exports.getHighestChannel = function (callback) {
    var fs = require('fs');
    var path = require('path');
    var dbPath = exports.getDbPath();
    fs.readdir(path.join(dbPath, 'channels'), function (err, channels) {
        callback(err, channels.length);
    });
};



