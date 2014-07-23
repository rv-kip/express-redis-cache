/**

  cache.del()
  ###########

  This script is supposed to be called via `index.js`

**/

module.exports = function (
/* RedisClient */ client,     // A Redis client
/* String */      name,       // The cache entry name to delete
/* Function */    callback    // Callback
) {
  
  var self = this;

  var domain = require('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {

    /** Tell Redis to delete hash **/
    client.del(self.prefix + name,
      domain.intercept(function (occ) {
        callback(null, +occ);
      }));
  });
};