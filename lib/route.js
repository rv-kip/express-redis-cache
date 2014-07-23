#! /usr/bin/env node

var $ = require;

 module.exports = function (name, expire) {

  var fn;

  var self = this;

  var domain = $('domain').create();

  domain.on('error', function (error) {
    callback(error);
  });

  domain.run(function () {
      
    fn = function (req, res, next) {

      name = name || req.path;
      
      // query cache to see if page cached
      self.get(name, domain.intercept(function (cache) {
        
        // if it's cached, display cache
        if ( cache ) {
          res.send(cache.body);
        }

        // otherwise, cache request
        else {
          var send = res.send.bind(res);

          res.expressRedisCache = true;

          res.send = function (body) {
            send(body);

            if ( this.expressRedisCache ) {
              self.add(name, body, expire,
                domain.intercept(function (name, cache) {
                  console.log('Created cache for ' + name);
                }));
            }
          };

          next();
        }

      }));
    };

  });

  return fn;
};