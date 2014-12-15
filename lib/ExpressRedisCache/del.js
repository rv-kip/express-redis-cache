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
      self.client.del(prefix + ':' + name,
        domain.intercept(function (deletions) {
          callback(null, +deletions);
        }));
    });
  }

  return del;

})();