/**

  express-redis-cache
  ###################

  # Constructor

      var options = {
        port: Number,         // Redis port
        host: String,         // Redis host
        prefix: String,       // Cache entry name prefix
        client: RedisClient   // use this Redis Client
      };
  
      var cache = require('express-redis-cache')(options);

  # Default events

  ## on error

  ## on message


**/

module.exports = function (options) {

  var index = {
    FOREVER: -1,

    connected: false,

    _on: {
    },

    on: function (event, then) {
      if ( ! this._on[event] ) {
        this._on[event] = [];
      }

      this._on[event].push(then);

      return this;
    },

    off: function (event) {
      if ( this._on[event] ) {
        delete this._on[event];
      }

      return this;
    },

    emit: function (event, message) {
      if ( Array.isArray(this._on[event]) ) {
        this._on[event].forEach(function (then) {
          then(message);
        });
      }

      return this;
    }

  };

  var domain = require('domain').create();

  domain.on('error', function (error) {
    index.emit('error', error);
  });

  domain.run(function () {
    options = options || {};

    var package = require('./package.json');

    var client = options.client || require('redis').createClient(options.port, options.host);

    client.on('error', function (error) {
      index.emit('error', error);
    });

    client.on('connect', function () {
      index.connected = true;
      index.emit('message', 'OK connected to Redis');
    });

    index.options   = options;
    index.client    = client;
    index.prefix    = options.prefix || package.config.prefix;

    index.ls = function (callback) {
      return require('./lib/ls').apply(this, [this.client, callback]);
    };

    index.get = function (name, callback) {
      return require('./lib/get').apply(this, [this.client, name, callback]);
    };

    index.add = function (name, body, expire, callback) {
      return require('./lib/add').apply(this, [this.client, name, body, expire, callback]);
    };

    index.del = function (name, callback) {
      return require('./lib/del').apply(this, [this.client, name, callback]);
    };

    index.route = function (name, expire) {
      return require('./lib/route').apply(this, [name, expire]);
    }.bind(index);

    index.size = function (callback) {
      return require('./lib/size').apply(this, [this.client, callback]);
    };

  });

  return index;
};