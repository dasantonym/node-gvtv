exports.get = function (callback) {
    var http = require('http');
    http.get('http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC', function (res) {
        var body = '';
        res.on('data', function(chunk) {
            body += chunk;
        });
        res.on('end', function() {
            try {
                var result = JSON.parse(body);
            } catch (e) {
                callback('json parse error',null, 'giphy');
                return;
            }
            if (result && result.data) {
                callback(null, result.data.image_original_url, 'giphy');
            } else {
                callback(error, null, 'giphy');
            }
        });
    }).on('error', function(err) {
        callback(err, null, 'giphy');
    });
};
