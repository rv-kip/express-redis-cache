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

        if ( res.expressRedisCache ) {
          self.emit('deprecated', {
            deprecated: 'expressRedisCache',
            substitute: 'use_express_redis_cache',
            file: __fileName,
            line: __line
          });

          res.use_express_redis_cache = res.expressRedisCache;

        }

        // If cache is disabled, call next()
        if ( res.use_express_redis_cache === false ) {
          return next();
        }

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
        if ( typeof options[0] === 'object' ) {
          if ( typeof options[0].expire === 'number' || typeof options[0].expire === 'object' || typeof options[0].expire === 'function') {
            expire = options[0].expire;
          }
        }

        if ( typeof options[0] === 'number' ) {
          expire = options[0];
        }
        else if ( typeof options[1] === 'number' || typeof options[1] === 'object') {
          expire = options[1];
        }

        var binary = false;
        if ( typeof options[0] === 'object' && typeof options[0].binary === 'boolean' ) {
          binary = options[0].binary;
        }

        var expirationPolicy = require('./expire')(expire);

        /** attempt to get cache **/
        self.get(name, domain.bind(function (error, cache) {

          /** If there was an error with cache then call next **/

          if ( error ) {
            return next();
          }

          /** if it's cached, display cache **/

          if ( cache.length &&  cache[0].body != null ) {
            res.contentType(cache[0].type || "text/html");
            if(binary){ //Convert back to binary buffer
              res.send(new Buffer(cache[0].body, 'base64'));
            }else{
              res.send(cache[0].body);
            }
          }

          /** otherwise, cache request **/
          else {

            /** wrap res.send **/
            var send = res.send.bind(res);

            res.send = function (body) {

              /** send output to HTTP client **/
              var ret = send(body);

              /** convert binary to base64 string **/
              if(binary && typeof body !== 'string'){
                body = new Buffer(body).toString('base64');
              }

              /** save only strings to cache **/
              if ( typeof body !== 'string' ) {
                return ret;
              }

              /** Create the new cache **/
              self.add(name, body, {
                  type: this._headers['content-type'],
                  expire: expirationPolicy(req, res)
                },
                domain.intercept(function (name, cache) {}));

              return ret;

            };

            return next();
          }

        }));
      };
    });

    return middleware;
  }

  return route;

}) ();
