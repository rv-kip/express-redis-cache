(function () {
  'use strict';

  var path      =   require('path');
  var assert    =   require('assert');

  var mocha     =   require('mocha');
  var should    =   require('should');

  var config    =   require('../../package.json').config;

  var prefix    =   'erct';
  var host      =   'localhost';
  var port      =   6379;

  var cache     =   require('../../')({
    prefix: prefix,
    host: host,
    port: port
  });

  describe ( 'del', function () {

    var error, deletions;

    before(function (done) {
      cache.add('test-to-del', '-', done);
    });

    it ( 'should be a function', function () {
      cache.del.should.be.a.Function;
    });

    it ( 'should callback', function (done) {
      cache.del('test-to-del', function ($error, $deletions) {
        error = $error;
        deletions = $deletions;
        done();
      });
    });

    it ( 'should not have error', function () {
      should(error).be.undefined;
    });

    it ( 'should be a number', function () {
      deletions.should.be.a.Number;
    });

    it ( 'should be a 1 or above', function () {
      deletions.should.be.above(0);
    });

  });
    
})();