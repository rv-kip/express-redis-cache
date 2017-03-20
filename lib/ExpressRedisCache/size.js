/**

  cache.ls()
  ##########

  This script is supposed to be called via `index.js`

**/

module.exports = function (
/* Function */    callback    // Callback
) {

  /** set in /index.js **/
  var self = this;

  var domain = require('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {

    /** Tell Redis to fetch the keys name beginning by prefix **/
    self.client.keys(self.prefix + '*', domain.intercept(function (keys) {

      var size = 0;

      require('async').parallel(

        /** for each keys **/

        keys.map(function (key) {
          return function (cb) {

            self.get(this.key.replace(new RegExp('^' + self.prefix), ''), cb);

          }
            .bind({ key: key });
        }),

        domain.intercept(function (results) {
          results.forEach(function (result) {
            size += require('../sizeof')(result);
          });

          callback(null, size);
        }));

    }));

  });
};