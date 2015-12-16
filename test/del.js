(function () {
  'use strict';

  var path      =   require('path');
  var assert    =   require('assert');

  var mocha     =   require('mocha');
  var should    =   require('should');

  var prefix    =   process.env.EX_RE_CA_PREFIX || 'erct:';
  var host      =   process.env.EX_RE_CA_HOST || 'localhost';
  var port      =   process.env.EX_RE_CA_PORT || 6379;

  var cache     =   require('../')({
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
      should(error).be.null;
    });

    it ( 'should be a number', function () {
      deletions.should.be.a.Number;
    });

    it ( 'should be a 1 or above', function () {
      deletions.should.be.above(0);
    });

  });

  describe ( 'del with wilcard', function () {

    var error, deletions;

    before(function (done) {

      var parallel = [0, 1, 2, 3 ,4, 5].map(function (num) {

        return function (done) {
          cache.add('test-to-del.' + this.num, '-', done);
        }.bind({ num: num });

      });

      require('async').series(parallel, function (error) {
        done(error);
      });
    });

    it ( 'should be a function', function () {
      cache.del.should.be.a.Function;
    });

    it ( 'should callback', function (done) {
      cache.del('test-to-del.*', function ($error, $deletions) {
        error = $error;
        deletions = $deletions;
        done();
      });
    });

    it ( 'should not have error', function () {
      should(error).be.null;
    });

    it ( 'should be a number', function () {
      deletions.should.be.a.Number;
    });

    it ( 'should be a 1 or above', function () {
      deletions.should.be.eql(6);
    });

  });

})();