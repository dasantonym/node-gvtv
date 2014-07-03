exports.getDirSize = function (dirPath, callback) {
    var fs = require('fs');
    var async = require('async');
    var path = require('path');
    fs.lstat(dirPath, function(err, stats) {
        var total = stats.size;
        var count = 0;
        if (!err && stats.isDirectory()) {
            fs.readdir(dirPath, function(err, list) {
                if (err) {
                    callback(err);
                    return;
                }
                async.forEach(list,
                    function(dirEntry, cb) {
                        exports.getDirSize(path.join(dirPath, dirEntry), function(err, size) {
                            total += size;
                            count += 1;
                            cb(err);
                        });
                    },
                    function(err) {
                        callback(err, total, count);
                    }
                );
            });
        } else {
            callback(err, total);
        }
    });
};

exports.getFirstJSONFromTemp = function (dbPath, callback) {
    var fs = require('fs');
    var path = require('path');
    var resource = require('./resource');
    fs.readdir(path.join(dbPath, 'tmp'), function (err, dir) {
        if (err) {
            console.log('failed to read db dir');
            callback(err);
            return;
        }
        if (dir.length > 0) {
            var i = 0;
            while (dir[i] && dir[i].indexOf('.0.json') === -1) {
                i+=1;
            }
            if (i===dir.length) {
                callback(null, null);
            } else {
                resource.getResource(path.resolve(dbPath, 'tmp', dir[i]), function (err, res) {
                    if (err) {
                        console.log('failed to read channel tmp file', err);
                        callback(err, null);
                        return;
                    }
                    callback(null, res);
                });
            }
        } else {
            callback();
        }
    });
};

exports.cleanTempDir = function (dbPath, callback) {
    var fs = require('fs');
    var async = require('async');
    var path = require('path');
    fs.readdir(path.join(dbPath, 'tmp'), function (err, tmpfiles) {
        if (err) {
            callback(err);
            return;
        }
        if (tmpfiles.length==0) {
            callback();
            return;
        }
        async.forEach(
            tmpfiles,
            function (file, next) {
                var currentFile = path.join(dbPath, 'tmp', file);
                async.waterfall([
                    function (cb) {
                        fs.stat(currentFile, cb);
                    },
                    function (stats, cb) {
                        if (stats.isDirectory()) {
                            fs.readdir(currentFile, function (err, list) {
                                if (err) {
                                    cb(err);
                                    return;
                                }
                                async.each(list, function (item, step) {
                                    fs.unlink(path.join(dbPath, 'tmp', file, item), step);
                                },
                                function (err) {
                                    if (err) {
                                        cb(err);
                                        return;
                                    }
                                    fs.rmdir(currentFile, cb);
                                });
                            });
                        } else {
                            fs.unlink(currentFile, cb);
                        }
                    }
                ],
                function (err) {
                    next(err);
                });
            },
            function (err) {
                callback(err);
            }
        );
    });
};