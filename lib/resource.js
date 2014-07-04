exports.getResource = function (path, callback) {
    var fs = require('fs');
    fs.readFile(path, function (err, data) {
        if (err) return callback(err, null);
        var result = null;
        try {
            result = JSON.parse(data);
        } catch (e) {
            return callback(e, null);
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
        return callback(e, null);
    }
    fs.writeFile(path, payload, function (err) {
        if (err) return callback(err, null);
        callback(null, payload);
    });
};
