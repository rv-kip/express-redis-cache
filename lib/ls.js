#! /usr/bin/env node

var $ = require;

module.exports = function (client, callback) {

  // set in /index.js
  var self = this;

  var domain = $('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {

    // REDIS KEY PREFIX*
    client.keys(self.prefix + '*', domain.intercept(function (keys) {
      $('async').parallel(

        // for each keys

        keys.map(function (key) {
          return function (cb) {
            var hash = this.key;

            client.hgetall(hash, domain.intercept(function (results) {
              results.name = hash.replace(new RegExp('^' + self.prefix), '');

              cb(null, results);
            
            }));
          }.bind({ key: key });
        }),

        callback
        );
    }));



  });
};