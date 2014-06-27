exports.db = null;

exports.insertChannel = function (params, callback) {
    var resource = require('./resource')
        , path = require('path')
        , now = Date.now()
        , dbPath = exports.db.getDbPath()
        , channelObject = {
            url: params.url,
            source: params.source,
            _id: now.toString()+Math.round(Math.random()*1000000).toString()
          };
    resource.setResource(path.resolve(dbPath, 'tmp', channelObject._id+'.0.json'), channelObject, callback);
};

exports.beginFetchChannel = function (id, callback) {
    var fs = require('fs')
        , path = require('path')
        , resource =require('./resource')
        , dbPath = exports.db.getDbPath()
        , filePath = path.resolve(dbPath, 'tmp', id+'.0.json')
        , filePathNew = path.resolve(dbPath, 'tmp', id+'.1.json');
    fs.rename(filePath, filePathNew, function (err) {
        if (err) {
            console.log("error renaming channel");
            callback(err);
            return;
        }
        resource.getResource(filePathNew, function (err, channel) {
            if (err) {
                console.log("error begin fetch channel");
            }
            callback(err, channel);
        });

    });
};

exports.successFetchChannel = function (id, callback) {
    var async = require('async')
        , fs = require('fs')
        , path = require('path')
        , resource = require('./resource')
        , util = require('./util')
        , dbPath = exports.db.getDbPath()
        , dataPath = path.join(dbPath, 'tmp', id+'.1.json')
        , gifPath = path.join(dbPath, 'tmp', id+'.gif');
    async.waterfall([
        function (cb) {
            resource.getResource(path.join(dbPath, 'pointer.json'), cb);
        },
        function (pointer, cb) {
            resource.getResource(path.join(dbPath, 'available.json'), function (err, available) {
                cb(err, pointer, available);
            });
        },
        function (pointer, available, cb) {
            util.getDirSize(dbPath, function (err, size) {
                if (err) {
                    cb(err);
                    return;
                }
                if (size >= exports.db.config.maxCacheSizeMB*1024*1024 && pointer >= available) {
                    pointer = 1;
                } else {
                    pointer += 1;
                }
                cb(null, pointer);
            });
        },
        function (pointer, cb) {
            var dataPathNew = path.join(dbPath, 'channels', pointer+'.json');
            fs.rename(dataPath, dataPathNew, function (err) {
                cb(err, pointer);
            });
        },
        function (pointer, cb) {
            var gifPathNew = path.join(dbPath, 'gif', pointer+'.gif');
            fs.rename(gifPath, gifPathNew, function (err) {
                cb(err, pointer);
            });
        },
        function (pointer, cb) {
            resource.setResource(path.join(dbPath, 'pointer.json'), pointer, function (err) {
                cb(err);
            });
        },
        function (cb) {
            fs.readdir(path.join(dbPath, 'channels'), cb);
        },
        function (channelDir, cb) {
            resource.setResource(path.join(dbPath, 'available.json'), channelDir.length, function (err, available) {
                cb(err, available);
            });
        }
    ],
    function (err) {
        callback(err);
    });
};

exports.failureFetchChannel = function (id, callback) {
    var fs = require('fs')
        , path = require('path')
        , dbPath = exports.db.getDbPath()
        , fileBasePath = path.resolve(dbPath, 'tmp', id);
    fs.unlink(fileBasePath+'.1.json', function (err) {
        if (err) {
            console.log("error removing channel json");
        }
        fs.unlink(fileBasePath+'.gif', function (err) {
            if (err) {
                console.log("error removing channel gif");
            }
            callback();
        });
    });
};