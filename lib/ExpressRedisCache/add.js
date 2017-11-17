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
        headers: (options.headers!== undefined)? JSON.stringify(options.headers) : "[]",
        touched: +new Date(),
        expire: (typeof options.expire !== 'undefined' && options.expire !== false) ? options.expire : self.expire
      };
      if( typeof entry.expire !== 'number'){
        //something wrong happen.
        //set expire to 0 to prevent
        entry.expire=0;
      }
      var size = require('../sizeof')(entry);

      var prefix = self.prefix.match(/:$/) ? self.prefix.replace(/:$/, '')
        : self.prefix;

      //we don't need to add in redis if expire =0
      if(entry.expire==0){
        callback(null, name, entry);
        return ;
      }

      /* Save as a Redis hash */
      var redisKey = prefix + ':' + name;
      self.client.hmset(redisKey, entry,
        domain.intercept(function (res) {
          var calculated_size = (size / 1024).toFixed(2);
          /** If @expire then tell Redis to expire **/
          if ( entry.expire > 0 ) {
            self.client.expire(redisKey, +entry.expire,
              domain.intercept(function () {
                self.emit('message', require('util').format('SET %s ~%d Kb %d TTL (sec)', redisKey, calculated_size, +entry.expire));
                callback(null, name, entry, res);
              }));
          }
          else
          {
            self.emit('message', require('util').format('SET %s ~%d Kb', redisKey, calculated_size));
            callback(null, name, entry, res);

          }
        }));
    });
  }

  return add;

})();
