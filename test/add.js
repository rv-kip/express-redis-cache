(function () {

  'use strict';

  var path      =   require('path');
  var assert    =   require('assert');

  var mocha     =   require('mocha');
  var should    =   require('should');

  var prefix    =   'erct:';
  var host      =   'localhost';
  var port      =   6379;

  var _name     =   'test1';
  var _body     =   'test1 test1 test1';
  var _type     =   'text/plain';

  var cache     =   require('../')({
    prefix: prefix,
    host: host,
    port: port
  });

  describe ( 'add', function () {

    var error, name, entry;

    it ( 'should be a function', function () {
      cache.add.should.be.a.Function;
    });

    it ( 'should callback', function (done) {
      cache.add(_name, _body, _type, 15,
        function ($error, $name, $entry) {
          error = $error;
          name = $name;
          entry = $entry;
          done();
        });
    });

    it ( 'should not have error', function () {
      should(error).be.undefined;
    });

    it ( 'should have a name which is a string and match the request', function () {
      name.should.be.a.String.and.equal(_name);
    });

    it ( 'should have a entry which is an object', function () {
      entry.should.be.an.Object;
      console.log(entry);
    });

    it ( 'entry which has a property body which a string matching the request', function () {
      entry.body.should.be.a.String.and.equal(_body);
    });

    it ( 'entry which has a property type which a string matching the request', function () {
      entry.type.should.be.a.String.and.equal(_type);
    });

  });

})();
