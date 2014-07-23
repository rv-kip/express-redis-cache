#! /usr/bin/env node

var $ = require;

module.exports = function (client, name, body, expire, callback) {
  var self = this;

  if ( ! callback && (typeof expire === 'function' || expire === -1) ) {
    callback = expire;
    expire = -1;
  }

  var domain = $('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {
    var cache = {
      body: body,
      touched: +new Date(),
      expire: expire || -1
    };

    client.hmset(self.prefix + name, cache,
      domain.intercept(function (res) {
        
        if ( typeof expire === 'number' && expire ) {
          client.expire(self.prefix + name, +expire,
            domain.intercept(function () {
              callback(null, name, cache, res);
            }));
        }

        else {
          callback(null, name, cache, res);
        }
      }));
  });
};