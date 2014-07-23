module.exports = function (options) {
  options = options || {};

  var package = require('./package.json');

  return {
    client: options.client || require('redis').createClient(options.port),

    prefix: options.prefix || package.config.prefix,

    FOREVER: -1,

    ls: function (callback) {
      return require('./lib/ls').apply(this, [this.client, callback]);
    },

    get: function (name, callback) {
      return require('./lib/get').apply(this, [this.client, name, callback]);
    },

    add: function (name, body, expire, callback) {
      return require('./lib/add').apply(this, [this.client, name, body, expire, callback]);
    },

    del: function (name, callback) {
      return require('./lib/del').apply(this, [this.client, name, callback]);
    },

    route: function (name, expire) {
      return require('./lib/route').apply(this, [name, expire]);
    }
  };
};