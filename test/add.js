/**

  Basic smoke test for method cache.add()
  #######################################

  Called by `test/test.js`

  # Abstract

  Expecting `test/test.js` to call this file and bind it with a `(require('express-redis-cache')())` instance.

  This instance should have an array property called `newCaches` which represent the entries that have been created when `test/test.js` is called. We use these entries to verify we can perform a basic smoke-test on method `cache.add()`.

  The `newCaches` contain new entries to create for both asserting `cache.add()` and `cache.route()`. The ones to be asserted here have their names prefixed by `new_`


**/

module.exports = function (cb) {

  var cache = this;

  var domain = require('domain').create();

  domain.on('error', function (error) {
    cb(error);
  });

  domain.run(function () {
    
    var assert = require('./assert');

    require('async').parallel(
      
      /** For each new cache **/
      cache.newCaches

        /** Only create the ones whose entry name begins by new_ **/
        .filter(function (entry) {
          return ( /^new_/.test(entry.name) );
        })

        /** create a function to test cache.add for each new cache **/
        .map(function (entry) {
          
          return function (next) {

            var add = this;

            cache.add(add.name, add.body, add.expire, domain.intercept(function (name, cache) {
              console.log();
              console.log(' Testing cache.add'.bold.blue);
              console.log();

              assert('Entry name should be ' + add.name, name === add.name);

              cache.name = name;

              require('./entry')(cache);

              assert('It should have the text ' + add.body, cache.body === add.body);

              next();
            }));
          }
            .bind({
              name:   entry.name,
              body:   entry.entry.body,
              expire: entry.entry.expire
            });
        }),

      /** Test done **/
      cb);

          
  });
};