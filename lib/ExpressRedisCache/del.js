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
      console.log('error error error', {
        error: error.name,
        message: error.message,
        stack: error.stack.split(/\n/)
      });
      callback(error);
    });

    domain.run(function () {

      var prefix = self.prefix.match(/:$/) ? self.prefix.replace(/:$/, '')
        : self.prefix;

      /** Tell Redis to delete hash **/
      var redisKey = prefix + ':' + name;
      self.client.keys(redisKey, domain.intercept(function(rows) {
        require('async').each(rows, function(row) {
          self.client.del(row,  domain.intercept(function () {
              self.emit('message', require('util').format('DEL %s', row));
            }));  
        }, callback(null, rows.length));
      });
    });
  }

  return del;

})();