(function () {

  'use strict';

  var path      =   require('path');
  var assert    =   require('assert');

  var mocha     =   require('mocha');
  var should    =   require('should');

  var config    =   require('../package.json').config;

  var prefix    =   'erct:';
  var host      =   'localhost';
  var port      =   6379;

  var _name     =   'test1';
  var _body     =   'test1 test1 test1';
  var _type     =   'text/plain';

  var cache     =   require('../')({
    prefix: prefix,
    host: host,
    port: port,
    expire: 2
  });

  describe ( 'add', function () {

    var error, name, entry;

    it ( 'should be a function', function () {
      cache.add.should.be.a.Function;
    });

    it ( 'should callback', function (done) {
      cache.add(_name, _body,
        function ($error, $name, $entry) {
          error = $error;
          name = $name;
          entry = $entry;
          done();
        });
    });

    it ( 'should not have error', function () {
      should(error).be.null;
    });

    it ( 'should have a name which is a string and match the request', function () {
      name.should.be.a.String.and.equal(_name);
    });

    it ( 'should have a entry which is an object', function () {
      entry.should.be.an.Object;
    });

    it ( ' - entry which has a property body which a string matching the request', function () {
      entry.body.should.be.a.String.and.equal(_body);
    });

    it ( ' - entry which has a property type which a string matching default type', function () {
      entry.type.should.be.a.String.and.equal(config.type);
    });

    it ( ' - entry which has a property touched which is a number which, when resolved to date, is less than 2 seconds from now', function () {
      entry.touched.should.be.a.Number;

      var date = new Date(entry.touched);

      ( (Date.now() - date) ).should.be.below(2000);
    });

    it ( ' - entry which has a property expire which equals cache.expire', function () {
      should(entry.expire).equal(cache.expire);
    });

    it ( 'should expire in ' + cache.expire + ' seconds', function (done) {
      this.timeout(2500); // allow more time for this test
      setTimeout(function(){
        cache.get(_name, function (err, res) {
          should(err).not.be.ok;
          res.should.be.an.Array.and.have.a.lengthOf(0);
          done();
        });
      }, cache.expire * 1000);
    });
  });
})();