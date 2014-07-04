describe('workers',function(){
    var path = require('path');
    var exec = require('exec');
    var config = {
        maxCacheSizeMB: 10,
        dbPath: path.join(__dirname, '..', 'db'),
        imgur: {
            client_id: '' // imgur test will fail without an app id
        }
    };
    var db = require(path.join(__dirname, '..', 'lib', 'db-file'));
    var workers = require(path.join(__dirname, '..', 'lib', 'workers'));

    before(function(done){
        db.initDb(config, function (err) {
            if (err) throw err;
            done();
        });
    });

    after(function(done) {
        exec(['rm', '-r', db.getDbPath()], function (err) {
            if (err) throw err;
            done();
        })
    });

    it('addGif from giphy', function (done) {
        workers.addGif(db, 'giphy', function (err) {
            if (err) throw err;
            done();
        });
    });

    it('addGif from imgur', function (done) {
        workers.addGif(db, 'imgur', function (err) {
            if (err) throw err;
            done();
        });
    });
});
