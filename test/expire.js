/**

  Check if expire expired
  #######################

  Called by `test/test.js`

  # Abstract

  Expecting `test/test.js` to call this file and bind it with a `(require('express-redis-cache')())` instance.

  This instance should have an array property called `newCaches` which represent the entries that have been test added. We use these entries to verify the expire entries have expired


**/

var expire = module.exports = function (cb) {

  var cache = this;

  var domain = require('domain').create();

  domain.on('error', function (error) {
    console.log(error);
    cb(error);
  });

  domain.run(function () {

    var assert = require('./assert');

    console.log('Please wait a few seconds ...');

    setTimeout(function () {
      require('async').parallel(
        cache.newCaches
          
          .filter(function (entry) {
            return !!( entry.entry.expire && typeof entry.entry.expire === 'number' && entry.entry.expire > 0 );
          })

          .map(function (entry) {
            return function (then) {
              var name = this.name;
              var entry = this.entry;

              console.log();
              console.log(' Testing expire'.bold.blue, name, entry);
              console.log();

              cache.get(name, domain.intercept(function ($entry) {

                if ( ! Object.keys($entry).length ) {
                  return then();
                }

                else {
                  console.log($entry);
                  then(new Error('This entry should have expired: ' + name));
                }
              }));
              
            }.bind(entry);
          }),

        cb);
    }, 1000 * 2);

  });
};