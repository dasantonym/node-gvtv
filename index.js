var db = require('./lib/db-file');

exports.setConfig = function(externalConfig, callback) {
    if (externalConfig) {
        config = externalConfig;
        callback();
    } else {
        callback('config unchanged');
    }
};

exports.getConfig = function () {
    return config;
};

exports.initDb = function(callback) {
    db.initDb(config, function (err) {
        if (err) return callback(err);
        callback(null, db);
    });
};

exports.startAddingGifs = function () {
    var workers = require('./lib/workers');
    workers.startAddingGifs(db);
};

exports.startWebServer = function(ip, port, documentsDir, callback) {
    var webserver = require('./lib/http-server');
    webserver.start(ip, port, documentsDir, callback);
};
