/**

  Basic smoke test for method cache.route()
  #########################################

  Called by `test/test.js`

  # Abstract

  Expecting `test/test.js` to call this file and bind it with a `(require('express-redis-cache')())` instance.

  This instance should have an array property called `caches` which represent the entries that have been created when `test/test.js` is called. We use these entries to verify we can perform a basic smoke-test on method `cache.route()`.


**/

module.exports = function (cb) {

  if ( typeof cb !== 'function' ) {
    throw new Error('Missing callback');
  }

  var cache = this;

  var domain = require('domain').create();

  var cacheEntry = '/path';

  domain.on('error', function (error) {
    cb(error);
  });

  domain.run(function () {

    var assert = require('./assert');

    require('async').parallel(
      /* for each new cache **/
      cache.newCaches
        
        /** if it is  a route cache */
        .filter(function (entry) {
          return !!( /^\/route_/.test(entry.name) );
        })

        .map(function (entry) {
          return function (then) {
            var name = this.name;
            var entry = this.entry;

            console.log();
            console.log(' Testing cache.route'.bold.blue, name, entry);
            console.log();

            /** Emulate req **/
            var req = {
              path: name
            };

            /** Emulate res **/
            var res = {
              send: function (body) {
                assert('it should be the same message', body === entry.body);

                then();
              }
            };

            /** Emulate next **/
            var next = function () {
              assert('There should be a response variable', !!res.expressRedisCache);

              res.send(entry.body);
            };

            var router = cache.route();

            assert('it should be a function', typeof router === 'function');

            /** Emulate a HTTP request **/
            
            router.apply(cache, [req, res, next]);

          }.bind(entry);
        }),

      cb);

  });
};