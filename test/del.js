/**

  Basic smoke test for method cache.ls()
  ######################################

  Called by `test/test.js`

  # Abstract

  Expecting `test/test.js` to call this file and bind it with a `(require('express-redis-cache')())` instance.

  This instance should have an array property called `newCaches` which represent the entries that have been test added. We use these entries to verify we can perform a basic smoke-test on method `cache.del()`.


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
      
      /** for each newCache **/
      cache.newCaches

        /** Delete only the one that have no expire **/
        .filter(function (entry) {
          return !!( ! entry.require || +entry.require === -1);
        })

        .map(function (entry) {
          return function (then) {

            var del = this;

            /** Test cache.del **/
            cache.del(del.name, domain.intercept(function (occ) {
              console.log();
              console.log(' Testing cache.del'.bold.blue);
              console.log();

              assert('it should be a number', ! isNaN(occ));
              assert('it should be 1', occ === 1);

              then();
            }));

          }
            .bind(entry);
        }),

        cb
      );

  });
};