module.exports = (function () {

  'use strict';

  var config = require('../package.json').config;

  /**  ExpressRedisCache
   *
   *  @class
   *  @description Main class
   *  @extends EventEmitter
   *  @arg {Object} options? - Options (view README)
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

    this.host = this.options.host || "localhost";

    /** The port to connect to (default port if null)
     *
     *  @type Number
     */

    this.port = this.options.port || "6379";

    /** The password of Redis server (optional)
     *
     *  @type String
     */
     this.auth_pass = this.options.auth_pass;

    /** An alias to disable expiration for a specific route
     *
     *  var cache = new ExpressRedisCache();
     *  cache.route('page', cache.FOREVER); // cache will not expire
     *
     *  @type number
     */

    this.FOREVER = -1;

    /** Set expiration time in seconds, default is -1 (No expire)
     *  @type number
     */

    this.expire = this.options.expire || this.FOREVER;

    /** Whether or not express-redis-cache is connected to Redis
     *
     *  @type Boolean
     */

    this.connected = false;

    /** The Redis Client
     *
     *  @type Object (preferably a client from the official Redis module)
     */

    this.client = this.options.client || require('redis').createClient(this.port, this.host, { auth_pass: this.auth_pass });

    /** If client can emit */

    if ( this.client.on ) {
      this.client.on('error', function (error) {
        this.emit('error', error);
      }.bind(this));

      this.client.on('connect', function () {
        this.connected = true;
        this.emit('connected', { host: this.host, port: this.port });
        this.emit('message', 'OK connected to redis://' + this.client.address);
      }.bind(this));

      this.client.on('end', function () {
        this.connected = false;
        this.emit('disconnected', { host: this.host, port: this.port });
        this.emit('message', 'Disconnected from redis://' + this.client.host + ':' + this.client.port);
      }.bind(this));
    }
  }

  /** Extend Event Emitter */

  require('util').inherits(ExpressRedisCache, require('events').EventEmitter);

  /**  js-comment
   *
   *  @method
   *  @description Get -
   *  @return void{Object}
   *  @arg {Object} arg - About arg
   */

  ExpressRedisCache.prototype.get = require('./ExpressRedisCache/get');

  /**  js-comment
   *
   *  @method
   *  @description This is a method
   *  @return void{Object}
   *  @arg {Object} arg - About arg
   */

  ExpressRedisCache.prototype.add = require('./ExpressRedisCache/add');

  /**  js-comment
   *
   *  @method
   *  @description This is a method
   *  @return void{Object}
   *  @arg {Object} arg - About arg
   */

  ExpressRedisCache.prototype.del = require('./ExpressRedisCache/del');

  /**  js-comment
   *
   *  @method
   *  @description This is a method
   *  @return void{Object}
   *  @arg {Object} arg - About arg
   */

  ExpressRedisCache.prototype.route = require('./ExpressRedisCache/route');

  /**  js-comment
   *
   *  @method
   *  @description This is a method
   *  @return void{Object}
   *  @arg {Object} arg - About arg
   */

  ExpressRedisCache.prototype.size = require('./ExpressRedisCache/size');

  /**  js-comment
   *
   *  @function
   *  @description Factory for ExpressRedisCache
   *  @return ExpressRedisCache
   *  @arg {Object} arg - About arg
   */

  ExpressRedisCache.init = function (options) {
    return new ExpressRedisCache(options);
  };

  return ExpressRedisCache;

})();
