module.exports = (function () {

  'use strict';

  function route () {
    /** The middleware to return */
    var middleware;

    var self = this;

    var options = arguments;

    var domain = require('domain').create();

    domain.on('error', function (error) {
      self.emit('error', error);
      // throw error;
    });

    domain.run(function () {
      middleware = function (req, res, next) {

        /** name */

        var name = req.originalUrl;

        if ( res.expressRedisCacheName ) {
          self.emit('deprecated', {
            deprecated: 'expressRedisCacheName',
            substitute: 'express_redis_cache_name',
            file: __fileName,
            line: __line
          });

          res.express_redis_cache_name = res.expressRedisCacheName;
        }

        if ( res.express_redis_cache_name ) {
          name = res.express_redis_cache_name;
        }

        if ( typeof options[0] === 'string' ) {
          name = options[0];
        }

        if ( typeof options[0] === 'object' && typeof options[0].name === 'string' ) {
          name = options[0].name;
        }

        /** Name cannot have wildcards in them */

        if ( /\*/.test(name) ) {
          return next(new Error('Name can not have wildcards'));
        }

        /** Expire */

        var expire = self.expire;

        if ( typeof options[0] === 'number' ) {
          expire = options[0];
        }

        else if ( typeof options[1] === 'number' ) {
          expire = options[1];
        }

        // If the cache isn't connected, respond
        if (self.connected === false) {
          return next();
        }

        /** attempt to get cache **/
        self.get(name, domain.intercept(function (cache) {

          /** if it's cached, display cache **/

          if ( cache.length ) {
            res.contentType(cache[0].type || "text/html");
            res.send(cache[0].body);
          }

          /** otherwise, cache request **/
          else {

            /** wrap res.send **/
            var send = res.send.bind(res);

            res.use_express_redis_cache = true;

            res.send = function (body) {

              /** send output to HTTP client **/

              send(body);

              if ( this.expressRedisCache ) {
                self.emit('deprecated', {
                  deprecated: 'expressRedisCache',
                  substitute: 'use_express_redis_cache',
                  file: __fileName,
                  line: __line
                });

                this.use_express_redis_cache = this.expressRedisCache;
              }

              if ( this.use_express_redis_cache ) {
                /** Create the new cache **/
                self.add(name, body, {
                    type: this._headers['content-type'],
                    expire: expire
                  },
                  domain.intercept(function (name, cache) {}));
              }
            };

            next();
          }

        }));
      };
    });

    return middleware;
  }

  return route;

}) ();
