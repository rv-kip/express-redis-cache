module.exports = (function () {

  'use strict';

  /**  Get
   *
   *  @function
   *  @description
   *  @return void
   *  @callback
   *  @arg {String} name - The cache entry name to get (wildcards accepted)
   *  @arg {Function} callback - Callback
   */

  function get (name, callback) {
    var self = this;

    var domain = require('domain').create();

    domain.on('error', function (error) {
      self.emit('error', error);
      callback(error);
      domain.exit();
    });

    domain.run(function () {


      if ( typeof name === 'function' ) {
        callback = name;
        name = '*';
      }

      var prefix = self.prefix.match(/:$/) ? self.prefix.replace(/:$/, '')
        : self.prefix;

      self.client.keys(prefix + ':' + name, domain.intercept(function (keys) {
        if ( ! keys.length ) {
          callback(null, []);
          return domain.exit();
        }

        require('async').parallel(keys.map(function (key) {
          return function (cb) {
            if(key){
              self.client.hgetall(key, domain.intercept(function (result) {
                var names = key.split(':');
                result.name = names[1];
                result.prefix = names[0];
                self.emit('message', require('util').format('GET %s ~%d Kb', key,
                  (require('../sizeof')(result) / 1024).toFixed(2)));
                cb(null, result);
              }));
            }else {
              cb(null, null);
            }
          };
        }), domain.intercept(function (results) {
          callback(null, results);
          domain.exit();
        }));
      }));

    });
  }

  return get;

}) ();
