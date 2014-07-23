var expire = module.exports = function (cb) {

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

    var assert = require('./assert');

    require('async').parallel(
      cache.newCaches
        
        .filter(function (entry) {
          return !!( entry.expire );
        })

        .map(function (entry) {
          return function (then) {
            var name = this.name;
            var entry = this.entry;

            console.log();
            console.log(' Testing expire'.bold.blue, entry);
            console.log();

            cache.get(name, domain.interpret(function (cache) {

              if ( ! cache ) {
                assert('cache should have expired', (!!cache === false) );
                return then();
              }

              cache.ttl(name, domain.interpret(function (seconds) {
                if ( seconds === -2 ) { // has already expired
                  throw new Error('cache has expired but cache.get() just returned it');
                }
                if ( seconds === -1 ) { // has no expire set
                  throw new Error('cache is supposed to have an Redis Expire set but has not');
                }
                if ( seconds === 0 ) { // if key was not found
                  throw new Error('cache not found in Redis but cache.get() just returned it');
                }

                setTimeout(function () {
                    var f = {
                      cache: cache
                    };
                    f.cache.newCaches = [entry];
                    
                    expire(cb).bind(f.cache);
                  }, seconds * 1000);
              }));

              return then(new Error('cache ' + name + ' should have expired'));
            }));
            
          }.bind(entry);
        }),

      cb);

  });
};