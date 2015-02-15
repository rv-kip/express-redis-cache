module.exports = (function () {

  'use strict';

  /**  Delete cache entries
   *
   *  @function
   *  @description
   *  @return void{}
   *  @arg {Object} query - Optional
   *  @arg {Function} callback
   */

  function del (name, callback) {
    var self = this;

    var domain = require('domain').create();

    domain.on('error', function (error) {
      callback(error);
    });

    domain.run(function () {

      var prefix = self.prefix.match(/:$/) ? self.prefix.replace(/:$/, '')
        : self.prefix;

      /** Tell Redis to delete hash **/
      var redisKey = prefix + ':' + name;

      self.client.del(redisKey,
        domain.intercept(function (deletions) {
          self.emit('message', require('util').format('DEL %s', redisKey));
          callback(null, +deletions);
        }));
    });
  }

  return del;

})();