module.exports = (function () {

  'use strict';

  /**  Delete cache entries
   *
   *  @method ExpressRedisCache.del
   *  @description Delete entry by name
   *  @return null
   *  @arg {String} name - The entry name
   *  @arg {Function} callback
   */

  function del (name, callback) {
    var self = this;

    if ( typeof name !== 'string' ) {
      return this.emit('error', new Error('ExpressRedisCache.del: missing first argument String'));
    }

    if ( typeof callback !== 'function' ) {
      return this.emit('error', new Error('ExpressRedisCache.del: missing second argument Function'));
    }

    var domain = require('domain').create();

    domain.on('error', function onDelError (error) {
      callback(error);
    });

    domain.run(function delRun () {

      /** Get prefix */

      var prefix = self.prefix.match(/:$/) ? self.prefix.replace(/:$/, '')
        : self.prefix;

      /** Tell Redis to delete hash */

      var redisKey = prefix + ':' + name;

      /** Detect wilcard syntax */

      var hasWildcard = redisKey.indexOf('*') >= 0;

      /** If has wildcard */

      if ( hasWildcard ) {

        /** Get a list of keys using the wildcard */

        self.client.keys(redisKey, domain.intercept(function onKeys (keys) {

          require('async').each(keys,

            function onEachKey (key, callback) {
              self.client.del(key,  domain.intercept(function () {
                self.emit('message', require('util').format('DEL %s', key));
                callback();
              }));
            },

            function onEachKeyDone (error) {

              if ( error ) {
                throw error;
              }

              callback(null, keys.length);

            });

        }));

      }

      /** No wildcard **/

      else {
        self.client.del(redisKey,
          domain.intercept(function onKeyDeleted (deletions) {
            self.emit('message', require('util').format('DEL %s', redisKey));
            callback(null, +deletions);
          }));
      }

    });
  }

  return del;

})();