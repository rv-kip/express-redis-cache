/**

  cache.add()
  ###########

  This script is supposed to be called via `index.js`

**/

module.exports = function (
/* RedisClient */ client,         // A redis client
/* String */      name,           // The cache entry name
/* String */      body,           // The cache entry body
/* String */      type,           // The cache entry content-type
/* Number */      expire,         // The cache life time    [OPTIONAL]
/* Function */    callback        // The callback function
) {
  
  var self = this;

  /** Adjust arguments in case @expire is omitted **/
  if ( ! callback && (typeof expire === 'function' || expire === -1) ) {
    callback = expire;
    expire = -1;
  }

  var domain = require('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {

    /** The new cache entry **/
    var cache = {
      body: body,
      type: type,
      touched: +new Date(),
      expire: expire || -1
    };

    var size = require('./sizeof')(cache);

    /* Save as a Redis hash */
    client.hmset(self.prefix + name, cache,
      domain.intercept(function (res) {

        self.emit('message', require('util').format('SET %s ~%d Kb',
          name, (size / 1024).toFixed(2)));
        
        /** If @expire then tell Redis to expire **/
        if ( typeof expire === 'number' && expire > 0 ) {
          client.expire(self.prefix + name, +expire,
            domain.intercept(function () {
              callback(null, name, cache, res);
            }));
        }

        else {
          callback(null, name, cache, res);
        }
      }));
  });
};