#! /usr/bin/env node

var $ = require;

module.exports = function (client, name, callback) {
  var self = this;

  var domain = $('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {

    client.del(self.prefix + name,
      domain.intercept(function (occ) {
        callback(null, occ);
      }));
  });
};