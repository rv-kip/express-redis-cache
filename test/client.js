/**

  Basic smoke test for constructing express-redis-cache with a client
  ===================================================================

  Called by `test/test.js`

  # Abstract

  Attempt to connect using `options.client`


**/

module.exports = function (cb) {

  if ( typeof cb !== 'function' ) {
    throw new Error('Missing callback');
  }

  var cache = this;

  var domain = require('domain').create();

  var cacheEntry = '/path';

  domain.on('error', function (error) {
    try {
      cb(error);
    }
    catch ( error2 ) {
      throw error;
    }
  });

  domain.run(function () {

    console.log();
    console.log(' Testing new cache({ client: RedisClient })'.bold.blue);
    console.log();

    var assert = require('./assert');

    var cacheClient = require('../')({
      client: require('redis').createClient(22)
    });

    cacheClient.on('error', function (error) {
      console.log(error.message);
      assert('it should not produce an error', typeof error === 'undefined');
    });

    cacheClient.client.quit();

    assert('it should be good', true);

    cb();

  });
};