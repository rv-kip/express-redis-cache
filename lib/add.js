(function () {

  'use strict';

  /**  Add
   *
   *  @function
   *  @description Add a new cache entry
   *  @return #callback
   *  @arg {RedisClient} client - A Redis Client
   *  @arg {String} name - The cache entry name
   *  @arg {String} body - The cache entry body
   *  @arg {String} type - The cache entry content-type ?? 
   *  @arg {Number} expire - The cache life time in seconds [OPTIONAL]
   *  @arg {Function} callback
   */

  function add (client, name, body, type, expire, callback) {
    var self = this;

    /** Adjust arguments in case @expire is omitted **/
    if ( ! callback && (typeof expire === 'function' || expire === -1) ) {
      callback = expire;
      expire = -1;
    }

    var domain = require('domain').create();

    domain.on('error', domain.bind(function (error) {
      console.log(error.stack)
      callback(error);
    }));

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
  }

  module.exports = add;

})();
