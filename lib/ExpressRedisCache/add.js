module.exports = (function () {

  'use strict';

  var config = require('../../package.json').config;

  /**  Add
   *
   *  @function
   *  @description Add a new cache entry
   *  @return void
   *  @callback
   *  @arg {String} name - The cache entry name
   *  @arg {String} body - The cache entry body
   *  @arg {Object} options - Optional { type: String, expire: Number } 
   *  @arg {Number} expire - The cache life time in seconds [OPTIONAL]
   *  @arg {Function} callback
   */

  function add (name, body, options, callback) {
    var self = this;

    /** Adjust arguments in case @options is omitted **/
    if ( ! callback && (typeof options === 'function') ) {
      callback = options;
      options = {};
    }

    var domain = require('domain').create();

    domain.on('error', domain.bind(function (error) {
      self.emit('error', error);
      callback(error);
    }));

    domain.run(function () {

      /** The new cache entry **/
      var cache = {
        body: body,
        type: options.type || config.type,
        touched: +new Date(),
        expire: options.expire || self.expire
      };

      var size = require('../sizeof')(cache);

      var prefix = self.prefix.match(/:$/) ? self.prefix.replace(/:$/, '')
        : self.prefix;

      /* Save as a Redis hash */
      self.client.hmset(prefix + ':' + name, cache,
        domain.intercept(function (res) {

          self.emit('message', require('util').format('SET %s ~%d Kb',
            name, (size / 1024).toFixed(2)));
          
          /** If @expire then tell Redis to expire **/
          if ( typeof cache.expire === 'number' && cache.expire > 0 ) {
            self.client.expire(self.prefix + name, +cache.expire,
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

  return add;

})();
