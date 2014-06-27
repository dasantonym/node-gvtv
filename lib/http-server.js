exports.start = function (ip, port, docDir, callback) {
    var http = require('http');
    var fs = require('fs');
    var path = require('path');
    var rootPath = path.resolve(__dirname, '../../..', docDir);
    var mimeTypes = {
        css: 'text/css',
        html: 'text/html',
        js: 'text/javascript',
        gif: 'image/gif',
        ttf: 'application/x-font-ttf',
        json: 'application/json'
    };
    http.createServer(function (req, res) {
        if (req.url === '/') req.url = 'index.html';
        var components = req.url.split('.');
        var extension = components[components.length-1];
        fs.readFile(path.join(rootPath, req.url), function (err, data) {
            if (err) {
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('not found');
            } else {
                if (data) {
                    res.writeHead(200, {'Content-Type': mimeTypes[extension]});
                    res.end(data);
                }
            }
        });
    }).listen(port, ip, 511, callback);
};
