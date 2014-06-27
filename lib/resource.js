exports.getResource = function (path, callback) {
    var fs = require('fs');
    fs.readFile(path, function (err, data) {
        if (err) {
            callback(err, null);
            return;
        }
        var result = null;
        try {
            result = JSON.parse(data);
        } catch (e) {
            callback(e, null);
            return;
        }
        callback(null, result);
    });
};

exports.setResource = function (path, data, callback) {
    var fs = require('fs');
    var payload = null;
    try {
        payload = JSON.stringify(data);
    } catch (e) {
        callback(e, null);
        return;
    }
    fs.writeFile(path, payload, function (err) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, payload);
    });
};
