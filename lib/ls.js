/**

  cache.ls()
  ##########

  This script is supposed to be called via `index.js`

**/

module.exports = function (client, callback) {

  /** set in /index.js **/
  var self = this;

  var domain = require('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {

    /** Tell Redis to fetch the keys name beginning by prefix **/
    client.keys(self.prefix + '*', domain.intercept(function (keys) {
      require('async').parallel(

        /** for each keys **/

        keys.map(function (key) {
          return function (cb) {

            self.get(this.key.replace(new RegExp('^' + self.prefix), ''), cb);

          }
            .bind({ key: key });
        }),

        callback
        );
    }));



  });
};