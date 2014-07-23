/**

  cache.get()
  ###########

  This script is supposed to be called via `index.js`

**/

module.exports = function (
/* RedisClient */ client,     // A Redis client
/* String */      name,       // The cache entry name to get
/* Function */    callback    // Callback
) {
  var self = this;

  var domain = require('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {

    /* Get cache */
    client.hgetall(self.prefix + name, domain.intercept(function (results) {
      results.name = name;
      callback(null, results);
    }));

  });
};