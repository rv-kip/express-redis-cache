module.exports = function (cb) {

  var cache = this;

  var domain = require('domain').create();

  var cacheEntry = '/path';

  function rollback (cb) {
    cache.del(cacheEntry, cb || function (error) {});
  }

  domain.on('error', function (error) {
    // rollback();
    cb(error);
  });

  domain.run(function () {

    console.log();
    console.log(' Testing cache.route'.bold.blue);
    console.log();

    var assert = require('./assert');

    var router = cache.route();

    assert('it should be a function', typeof router === 'function');

    require('async').parallel(
      cache.newCaches
        
        .filter(function (entry) {
          return !!( /^route_/.test(entry.name) );
        })

        .map(function (entry) {
          return function (then) {
            var name = this.name;
            var entry = this.entry;

            var req = {
              path: name
            };

            var res = {
              send: function (body) {
                assert('it should be the same message', body === entry.body);

                then();
              }
            };

            var next = function () {
              assert('There should be a response variable', !!res.expressRedisCache);

              res.send(entry.body);
            };

            router(req, res, next);
          }.bind(entry);
        }),

      cb);

  });
};