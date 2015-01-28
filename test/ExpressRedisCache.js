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

  describe ( 'Module', function () {

    it ( 'should be a function', function () {
      cache = require('../');
      cache.should.be.a.function;
    });

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

    it ( 'should have a property options which is an object', function () {
      cache.should.have.property('options')
        .which.is.an.Object;
    });

    it ( 'should have a property prefix which is a string and equals request prefix', function () {
      cache.should.have.property('prefix')
        .which.is.a.String
        .and.equal(prefix);
    });

    it ( 'should have a property host which is a string and equals request host', function () {
      cache.should.have.property('host')
        .which.is.a.String
        .and.equal(host);
    });

    it ( 'should have a property port which is a number and equals request port', function () {
      cache.should.have.property('port')
        .which.is.a.Number
        .and.equal(port);
    });

    it ( 'should have a property FOREVER which is a number and equals -1', function () {
      cache.should.have.property('FOREVER')
        .which.is.a.Number
        .and.equal(-1);
    });

    it ( 'should have a property connected which is a boolean and is true', function () {
      cache.should.have.property('connected')
        .which.is.a.Boolean
        .and.is.true;
    });

    it ( 'should have a property client which is a RedisClient', function () {
      cache.should.have.property('client')
        .which.is.an.Object;

      cache.client.constructor.name.should.equal('RedisClient');
    });

  });

})();