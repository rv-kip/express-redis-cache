module.exports = (function () {

  'use strict';

  /** route() - Create a middleware
   *
   *  @method ExpressRedisCache.route
   *  @return {Function} middleware
   */

  function route () {

    /** The middleware to return
     *
     *  @type Function
     */

    var middleware;

    /** A reference to this
     *
     *  @type ExpressRedisCache
     */

    var self = this;

    /** The route options
     *
     *  @type List
     */

    var options = arguments;

    /** The domain handler 
     *  
     *  @type Domain 
     */

    var domain = require('domain').create();

    /** The domain error handler 
     *  
     *  @type Domain 
     */

    domain.on('error', function (error) {
      self.emit('error', error);
    });

    domain.run(function () {

      // Build the middleware function

      /**
       *  @function
       *  @arg {IncomingMessage} req
       *  @arg {HttpResponse} res
       *  @arg {Function} next
       */

      middleware = function expressRedisCache_Middleware (req, res, next) {

        // If the cache isn't connected, call next()

        if ( self.connected === false || self.client.connected === false ) {
          return next();
        }

        /** Cache entry name
         *
         *  @type String
         *  @description The name the cache entry will be saved under
         *  @default req.originalUrl
         */

        var name = req.originalUrl;

        /**
         *  @deprecated `res.expressRedisCacheName` is deprecated starting on v0.1.1, `use res.express_redis_cache_name` instead
         */

        if ( res.expressRedisCacheName ) {
          self.emit('deprecated', {
            deprecated: 'expressRedisCacheName',
            substitute: 'express_redis_cache_name',
            file: __fileName,
            line: __line
          });

          res.express_redis_cache_name = res.expressRedisCacheName;
        }

        // If a cache has been explicitly attached to `res` then use it as name

        if ( res.express_redis_cache_name ) {
          name = res.express_redis_cache_name;
        }

        // If route() was called with a string as its first argument, use this string as name

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

        /** The seconds entry lives
         *
         *  @type Number
         *  @default this.expire
         */

        var expire = self.expire;
        if ( typeof options[0] === 'object' && typeof options[0].expire === 'number' ) {
          expire = options[0].expire;
        }

        if ( typeof options[0] === 'number' ) {
          expire = options[0];
        }
        else if ( typeof options[1] === 'number' ) {
          expire = options[1];
        }

        /** attempt to get cache **/
        self.get(name, domain.bind(function (error, cache) {

          /** If there was an error with cache then call next **/

          if ( error ) {
            return next();
          }

          /** if it's cached, display cache **/

          if ( cache.length ) {
            res.contentType(cache[0].type || "text/html");
            res.send(cache[0].body);
          }

          /** otherwise, cache request **/
          else {

            /** wrap res.send **/
            var send = res.send.bind(res);

            if ( typeof res.use_express_redis_cache === 'undefined' ) {
              res.use_express_redis_cache = true;
            }

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
