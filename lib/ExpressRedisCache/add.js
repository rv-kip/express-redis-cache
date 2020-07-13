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
   *  @arg {Object} options - Optional { type: String, expire: Number, status: Number }
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
      self.connected = false;
      callback(error);
    }));

    domain.run(function () {

      if (self.connected === false) {
        return callback(null, []); // simulate cache miss
      }

      /** The new cache entry **/
      var entry = {
        body: body,
        type: options.type || config.type,
        status: options.status || 200,
        touched: +new Date(),
        expire: (typeof options.expire !== 'undefined' && options.expire !== false) ? options.expire : self.expire
      };

      var size = require('../sizeof')(entry);

      var prefix = self.prefix.match(/:$/) ? self.prefix.replace(/:$/, '')
        : self.prefix;

      /** Serialize the entry to JSON so it can be stored as a regular key's value. */
      var redisKey = prefix + ':' + name;
      var args = [redisKey, JSON.stringify(entry)];

      /** If @expire then tell Redis to expire **/
      if (typeof entry.expire === 'number' && entry.expire > 0) {
        args.push('EX', entry.expire);
      }

      self.client.set(args,
        domain.intercept(function (res) {
          var calculated_size = (size / 1024).toFixed(2);
          var msg = require('util').format('SET %s ~%d Kb', redisKey, calculated_size);
          if (typeof entry.expire === 'number' && entry.expire > 0) {
            msg += require('util').format(' %d TTL (sec)', +entry.expire);
          }
          self.emit('message', msg);
          callback(null, name, entry, res);
        }));
    });
  }

  return add;

})();
