// returns random gif from imgur.com

exports.config = null;

exports.get = function (callback) {
    var request = require('request');

    var options = {
        url: 'https://api.imgur.com/3/gallery/random/random/'+Math.round(Math.random()*50).toString(),
        timeout: 10000,
        headers: {
            'User-Agent': 'GVTV via node-request',
            'Authorization': 'Client-ID '+exports.config.imgur.client_id
        }
    };

    request.get(options, function (error, response, body) {
        if (error) {
            callback(error,null, 'imgur');
            return;
        }

        var result;
        var selectedImage = null;
        var counter = 0;

        try {
            result = JSON.parse(body);
        } catch (e) {
            callback('json parse error', null, 'imgur');
            return;
        }
        while (selectedImage == null && counter < 50) {
            var randIndex = Math.round(Math.random()*result.data.length-1);
            if (result && result.data && result.data[randIndex] && result.data[randIndex].animated) {
                selectedImage = result.data[randIndex];
            }
            counter+=1;
        }
        if (selectedImage) {
            callback(null,selectedImage.link, 'imgur');
        } else {
            callback('no image found', null, 'imgur');
        }
    });
};
