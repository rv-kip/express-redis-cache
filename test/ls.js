(function () {

  'use strict';

  var path      =   require('path');
  var assert    =   require('assert');

  var mocha     =   require('mocha');
  var should    =   require('should');

  var prefix    =   'erct:';
  var host      =   'localhost';
  var port      =   6379;

  var cache     =   require('../')({
    prefix: prefix,
    host: host,
    port: port
  });

  describe ( 'ls', function () {

    var error;

    it ( 'should be a function', function () {
      cache.ls.should.be.a.Function;
    });

    it ( 'should callback', function (done) {
      cache.ls(function ($error) {
        error = $error;
        done();
      });
    });

    it ( 'should not have error', function () {
      should(error).be.undefined;
    });

  });

})();
