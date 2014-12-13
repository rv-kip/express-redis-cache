(function () {

  'use strict';

  var config = require('./package.json').config;

  /**  ExpressRedisCache
   *
   *  @class
   *  @description This is a class
   *  @extends EventEmitter
   *  @arg {Object} options? - Options
   */

  function ExpressRedisCache (options) {

    /** The request options
     *
     *  @type Object
     */

    this.options = options || {};

    /** The entry name prefix 
     *
     *  @type String
     */

    this.prefix = this.options.prefix || config.prefix;

    /** The host to connect to (default host if null) 
     *
     *  @type String
     */

    this.host = this.options.host;

    /** The port to connect to (default port if null) 
     *
     *  @type Number
     */

    this.port = this.options.port;
    
    /** An alias to remove expiration when invoking a route
     *  
     *  var cache = new ExpressRedisCache();
     *  cache.route('page', cache.FOREVER); // cache will not expire
     *
     *  @type number
     */
    
    this.FOREVER = -1;

    /** Whether or not express-redis-cache is connected to Redis
     *  
     *  @type Boolean
     */

    this.connected = false;

    /** The Redis Client 
     *
     *  @type Object (preferably a client from the official Redis module)
     */

    this.client = this.options.client || require('redis').createClient(this.port, this.host);

    /** If client can emit */

    if ( this.client.on ) {
      this.client.on('error', function (error) {
        this.emit('error', error);
      }.bind(this));

      this.client.on('connect', function () {
        this.connected = true;
        this.emit('connected', { host: this.host, port: this.port });
        this.emit('message', 'OK connected to Redis');
      }.bind(this));
    }
  }

  /** Extend Event Emitter */

  require('util').inherits(ExpressRedisCache, require('events').EventEmitter);

  /**  List all cached entries in Redis
   *
   *  @method
   *  @description List all cached entries in Redis
   *  @return void{Object}
   *  @arg {Object} arg - About arg 
   */

  ExpressRedisCache.prototype.ls = function (callback) {
    return require('./lib/ls').apply(this, [this.client, callback]);
  };

  /**  js-comment
   *
   *  @method
   *  @description This is a method
   *  @return void{Object}
   *  @arg {Object} arg - About arg 
   */

  ExpressRedisCache.prototype.get = function (name, callback) {
    return require('./lib/get').apply(this, [this.client, name, callback]);
  };

  /**  js-comment
   *
   *  @method
   *  @description This is a method
   *  @return void{Object}
   *  @arg {Object} arg - About arg 
   */

  ExpressRedisCache.prototype.add = function (name, body, expire, callback) {
    return require('./lib/add').apply(this, [this.client, name, body, expire, callback]);
  };

  /**  js-comment
   *
   *  @method
   *  @description This is a method
   *  @return void{Object}
   *  @arg {Object} arg - About arg 
   */

  ExpressRedisCache.prototype.del = function (name, callback) {
    return require('./lib/del').apply(this, [this.client, name, callback]);
  };

  /**  js-comment
   *
   *  @method
   *  @description This is a method
   *  @return void{Object}
   *  @arg {Object} arg - About arg 
   */

  ExpressRedisCache.prototype.route = function (name, expire) {
    return require('./lib/route').apply(this, [name, expire]);
  };

  /**  js-comment
   *
   *  @method
   *  @description This is a method
   *  @return void{Object}
   *  @arg {Object} arg - About arg 
   */

  ExpressRedisCache.prototype.size = function (callback) {
    return require('./lib/size').apply(this, [this.client, callback]);
  };

  /**  js-comment
   *
   *  @function
   *  @description This is a function
   *  @return void{Object}
   *  @arg {Object} arg - About arg 
   */

  ExpressRedisCache.init = function (options) {
    return new ExpressRedisCache(options);
  }

  module.exports = ExpressRedisCache.init;

})();
