#! /usr/bin/env node

var $ = require;

var t = module.exports = function (client, name, callback) {
  var self = this;

  var domain = $('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {

    client.hget(self.prefix + name, 'touched', domain.intercept(function (results) {
      if ( ! results ) {
        return callback();
      }
      client.hgetall(self.prefix + name, domain.intercept(function (results) {
        results.name = name;
        callback(null, results);
      }));
    }));
  });
};