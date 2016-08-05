(function () {

  'use strict';

  var path      =   require('path');
  var assert    =   require('assert');

  var mocha     =   require('mocha');
  var should    =   require('should');

  var prefix    =   process.env.EX_RE_CA_PREFIX || 'erct:';
  var host      =   process.env.EX_RE_CA_HOST || 'localhost';
  var port      =   process.env.EX_RE_CA_PORT || 6379;
  
  var _name     =   'test1';
  var _body     =   'test1 test1 test1';
  var _type     =   'text/plain';

  var cache     =   require('../')({
    prefix: prefix,
    host: host,
    port: port
  });

  describe ( 'get', function () {

    var error, results;

    it ( 'should be a function', function () {
      cache.get.should.be.a.Function;
    });

    it ( 'should callback', function (done) {
      cache.get(null, function ($error, $results) {
        error = $error;
        results = $results;
        done();
      });
    });

    it ( 'should not have error', function () {
      should(error).be.null;
    });

    it ( 'should be an array', function () {
      results.should.be.an.Array;
    });

    it ( ' - entry which has a property name which a string', function () {
      results.forEach(function (result) {
        result.name.should.be.a.String;
      });
    });

    it ( ' - entry which has a property body which a string', function () {
      results.forEach(function (result) {
        result.body.should.be.a.String;
      });
    });

    it ( ' - entry which has a property type which a string', function () {
      results.forEach(function (result) {
        result.type.should.be.a.String;
      });
    });

    it ( ' - entry which has a property touched which is a number which resolves to date', function () {
      results.forEach(function (result) {
        Number(result.touched).should.be.a.Number;

        new Date(Number(result.touched))
          .should.be.a.Date;
      });
    });

    it ( 'should support wildcard gets', function (done) {
      cache.add('wildkey1', 'abc',
        function ($error, $name, $entry) {
          cache.add('wildkey2', 'def',
            function ($error, $name, $entry) {
              cache.get('wildkey*', function ($error, $results) {
                $results.should.be.an.Array;
                $results.should.have.a.lengthOf(2);
                done();
              });
            });
        });
    });

    it ( 'should support specific gets without calling keys', function (done) {

      // wrap the call to keys, so we can see if it's called
      var callCount = 0;
      var wrap = function(fn){
        return function(){
          console.log('What!?');
          callCount++;
          return fn.apply(this, arguments);
        };
      };

      cache.client.keys = wrap(cache.client.keys);

      cache.add('wildkey1', 'abc',
        function ($error, $name, $entry) {
          cache.add('wildkey2', 'def',
            function ($error, $name, $entry) {
              cache.get('wildkey1', function ($error, $results) {
                try {
                  $results.should.be.an.Array;
                  $results.should.have.a.lengthOf(1);
                  callCount.should.equal(0);
                  done();
                } catch (e) {
                  done(e);
                }
              });
            });
        });
    });
  });

})();
