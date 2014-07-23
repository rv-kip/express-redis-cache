/**

  Basic smoke test for method cache.get()
  #######################################

  Called by `test/test.js`

  # Abstract

  Expecting `test/test.js` to call this file and bind it with a `(require('express-redis-cache')())` instance.

  This instance should have an array property called `caches` which represent the entries that have been created when `test/test.js` is called. We use these entries to verify we can perform a basic smoke-test on method `cache.get()`.


**/

module.exports = function (cb) {

  var cache = this;

  var domain = require('domain').create();

  domain.on('error', function (error) {
    cb(error);
  });

  domain.run(function () {
    var assert = require('./assert');

    /** Test cache.get() with each new entries simultaneously **/
    require('async').parallel(
      
      cache.caches

        .map(function (entry) {
          return function (next) {
            var get = this;

            /** Test cache.get() **/
            cache.get(get.name, domain.intercept(function (cache) {
              console.log();
              console.log(' Testing cache.get'.bold.blue, get);
              console.log();

              require('./entry')(cache);

              next();
            }));
          }
            .bind(entry);
        }),


        cb);

          
  });
};