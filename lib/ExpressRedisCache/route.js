import Expire from "./expire";

/** route() - Create a middleware
 *
 *  @method ExpressRedisCache.route
 *  @return {Function} middleware
 */

function route() {
  /** A reference to this
   *
   *  @type ExpressRedisCache
   */

  let self = this;

  /** The route options
   *
   *  @type List
   */

  let options = arguments;

  // Build the middleware function

  /**
   *  @function
   *  @arg {IncomingMessage} req
   *  @arg {HttpResponse} res
   *  @arg {Function} next
   */

  return function expressRedisCache_Middleware(req, res, next) {
    if (res.expressRedisCache) {
      self.emit("deprecated", {
        deprecated: "expressRedisCache",
        substitute: "use_express_redis_cache",
        file: __filename, // eslint-disable-line
        line: __line // eslint-disable-line
      });

      res.use_express_redis_cache = res.expressRedisCache;
    }

    // If cache is disabled, call next()
    if (res.use_express_redis_cache === false) {
      return next();
    }

    // If the cache isn't connected, call next()

    if (self.connected === false || self.client.connected === false) {
      return next();
    }

    /** Cache entry name
     *
     *  @type String
     *  @description The name the cache entry will be saved under
     *  @default req.originalUrl
     */

    let name = req.originalUrl;

    /**
     *  @deprecated `res.expressRedisCacheName` is deprecated starting on v0.1.1, `use res.express_redis_cache_name` instead
     */

    if (res.expressRedisCacheName) {
      self.emit("deprecated", {
        deprecated: "expressRedisCacheName",
        substitute: "express_redis_cache_name",
        file: __filename,
        line: __line // eslint-disable-line
      });

      res.express_redis_cache_name = res.expressRedisCacheName;
    }

    // If a cache has been explicitly attached to `res` then use it as name

    if (res.express_redis_cache_name) {
      name = res.express_redis_cache_name;
    }

    // If a tag has been explicitly attached to `res` then use it as tag

    if (res.express_redis_cache_tag) {
      tag = res.express_redis_cache_tag;
    }

    // If route() was called with a string as its first argument, use this string as name

    if (typeof options[0] === "string") {
      name = options[0];
    }

    if (typeof options[0] === "object" && typeof options[0].name === "string") {
      name = options[0].name;
    }

    /** Name cannot have wildcards in them */

    if (/\*/.test(name)) {
      return next(new Error("Name can not have wildcards"));
    }

    /** The seconds entry lives
     *
     *  @type Number
     *  @default this.expire
     */

    let expire = self.expire;

    /** The object representing the tag for the cache key
     *
     *  @type String
     *  @default this.tag
     */

    let tag = self.tag;

    if (typeof options[0] === "object") {
      if (
        typeof options[0].expire === "number" ||
        typeof options[0].expire === "object" ||
        typeof options[0].expire === "function"
      ) {
        expire = options[0].expire;
      }

      if (typeof options[0].tag === "string") {
        tag = options[0].tag;
      }
    }

    if (typeof options[0] === "number") {
      expire = options[0];
    } else if (
      typeof options[1] === "number" ||
      typeof options[1] === "object"
    ) {
      expire = options[1];
    }

    let binary = false;
    if (
      typeof options[0] === "object" &&
      typeof options[0].binary === "boolean"
    ) {
      binary = options[0].binary;
    }

    let expirationPolicy = Expire(expire);

    /** attempt to get cache **/
    self.get(name, (error, cache) => {
      /** If there was an error with cache then call next **/

      if (error) {
        return next();
      }

      /** set a default cache-control value based on the default expiration **/
      if (
        !res._headers["cache-control"] &&
        typeof expire === "number" &&
        !res.express_redis_cache_disable_cache_control
      ) {
        res._headers["cache-control"] = `max-age=${expire}000`;
      }

      /** if it's cached, display cache **/
      if (cache.length && cache[0].body != null) {
        res.contentType(cache[0].type || "text/html");
        if (binary) {
          //Convert back to binary buffer
          res.send(new Buffer.from(cache[0].body).toString("base64"));
        } else {
          res.send(cache[0].body);
        }
      } else {
        /** otherwise, cache request **/
        /** wrap res.send **/
        let send = res.send.bind(res);

        res.send = function(body) {
          /** send output to HTTP client **/
          let ret = send(body);

          /** convert binary to base64 string **/
          if (binary && typeof body !== "string") {
            body = new Buffer.from(body).toString("base64");
          }

          /** save only strings to cache **/
          if (typeof body !== "string") {
            return ret;
          }

          const expire = expirationPolicy(req, res);

          /** update the default cache-control value based on the response status **/
          if (
            !res._headers["cache-control"] &&
            typeof expire === "number" &&
            !res.express_redis_cache_disable_cache_control
          ) {
            res._headers["cache-control"] = `max-age=${expire}000`;
          }
          /** Create the new cache **/
          self.add(
            name,
            body,
            {
              type: this._headers["content-type"],
              expire,
              tag
            },
            function (name, cache) {}); // eslint-disable-line

          return ret;
        };

        return next();
      }
    });
  };
}

export default route;
