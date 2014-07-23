/**

  Basic smoke test for method cache.ls()
  ######################################

  Called by `test/test.js`

  # Abstract

  Expecting `test/test.js` to call this file and bind it with a `(require('express-redis-cache')())` instance.

  This instance should have an array property called `caches` which represent the entries that have been created when `test/test.js` is called. We use these entries to verify we can perform a basic smoke-test on method `cache.ls()`.


**/

module.exports = function (cb) {
  var cache = this;

  var domain = require('domain').create();

  domain.on('error', function (error) {
    cb(error);
  });

  domain.run(function () {
    var assert = require('./assert');

    /** Test cache.ls() **/
    cache.ls(domain.intercept(function (entries) {
      console.log();
      console.log(' Testing cache.ls'.bold.blue);
      console.log();

      /** Assert entries */
      assert('entries should be an Array', Array.isArray(entries));
      assert('there should be at least 1 entry', entries.length);

      /** Assert each entry */
      entries.forEach(require('./entry'));

      /** Assert our entries created by test/test.js (cache.caches) are here **/
      cache.caches.forEach(function (c) {
        var f = entries.filter(function (entry) {
          return entry.name === c.name;
        });
        assert('There should be a cache entry named ' + c.name, f.length === 1);
        assert('There should be the same body ' + c.name, f[0].body === c.entry.body);
        assert('There should be the same expire ' + c.name, +f[0].expire === +c.entry.expire);
      });

      /** Test done **/
      cb();
    }));
  });
};