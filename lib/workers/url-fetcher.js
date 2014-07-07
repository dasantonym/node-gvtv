module.exports = function (channel, source, callback) {
    var async = require('async');
    var worker;

    if (source==='giphy') {
        worker = require('../fetchers/giphy');
    } else if (source==='imgur') {
        worker = require('../fetchers/imgur');
        worker.config = channel.db.config;
    } else if (source==='ds106') {
        worker = require('../fetchers/ds106');
        worker.config = channel.db.config;
    }

    async.waterfall([
        worker.get,
        function (url, source, cb) {
            channel.insertChannel({
               url: url,
               source: source
            }, cb);
        }
    ],
    function (err) {
        if (err) {
            //console.log('url fetcher error', err);
        }
        callback(err);
    });
};
