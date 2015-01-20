(function () {

  'use strict';

  var path      =   require('path');
  var assert    =   require('assert');

  var mocha     =   require('mocha');
  var should    =   require('should');

  var cache;

  var prefix    =   'erct:';
  var host      =   'localhost';
  var port      =   6379;

  /** Unit test index.js */

  describe ( 'Module', function () {

    /** index.js should expose a function */

    it ( 'should be a function', function () {
      cache = require('../');
      cache.should.be.a.function;
    });

    /** Calling that function should return a new instance of ExpressRedisCache */

    it ( 'should return a new ExpressRedisCache', function (done) {
      cache = cache({ prefix: prefix, host: host, port: port });
      cache.constructor.name.should.equal('ExpressRedisCache');
      cache.on('error', function (error) {
        throw error;
      });
      cache.on('connected', function () {
        done();
      });
    });

    /** PROPERTIES */

    /** {Object} cache.options */

    it ( 'should have a property options which is an object', function () {
      cache.should.have.property('options')
        .which.is.an.Object;
    });

    /** {String} cache.prefix */

    it ( 'should have a property prefix which is a string and equals request prefix', function () {
      cache.should.have.property('prefix')
        .which.is.a.String
        .and.equal(prefix);
    });

    /** {Object} cache.host */

    it ( 'should have a property host which is a string and equals request host', function () {
      cache.should.have.property('host')
        .which.is.a.String
        .and.equal(host);
    });

    /** {Number} cache.port */

    it ( 'should have a property port which is a number and equals request port', function () {
      cache.should.have.property('port')
        .which.is.a.Number
        .and.equal(port);
    });

    /** {Number} cache.FOREVER */

    it ( 'should have a property FOREVER which is a number and equals -1', function () {
      cache.should.have.property('FOREVER')
        .which.is.a.Number
        .and.equal(-1);
    });

    /** {Boolean} cache.connected */

    it ( 'should have a property connected which is a boolean and is true', function () {
      cache.should.have.property('connected')
        .which.is.a.Boolean
        .and.is.true;
    });

    /** {RedisClient} cache.client */

    it ( 'should have a property client which is a RedisClient', function () {
      cache.should.have.property('client')
        .which.is.an.Object;

      cache.client.constructor.name.should.equal('RedisClient');
    });

  });

  /** Specify host and port */

  describe ( 'Specifying host and port', function () {

    before ( function (done) {
      var cache = require('../');

      var client1 = cache({ host: 'app.com', port: 1927 });

      client1.on('error', done);

      client1.on('connected', function () {
        done();
      });
    });

    it ( 'should be cool', function () {

    });

  });

})();
