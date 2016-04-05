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

  var _name     =   'test-route' + process.pid;
  var _expire   =   60;

  /** Emulate req **/
  var req = {
    originalUrl: '/index'
  };

  /** Emulate res **/
  var res = {
    statusCode: 200,
    send: function (body) {

    },
    _headers: {
      'content-type': 'text/plain'
    }
  };

  /** Emulate next **/
  var next = function () {
    // res.send(entry.body);
  };

  describe ( 'route', function () {

    var middleware, error, results;

    it ( 'should be a function', function () {
      cache.route.should.be.a.Function();
    });

    it ( 'should return a function', function () {
      middleware = cache.route(_name, _expire);
      middleware.should.be.a.Function();
    });

    describe('On Calling the route', function () {

      it ( 'should call next', function (done) {
        middleware(
          req,
          res,
          function (error) {
            if ( error ) {
              throw error;
            }
            res.send('hello folks!');
            done();
          });
      });

      it ( 'should have created the cache entry', function (done) {
        cache.get(_name, function (error, $results) {
          if ( error ) {
            throw error;
          }
          $results.length.should.be.above(0);
          results = $results;
          done();
        });
      });

      describe ( 'cache entry', function () {

        it ( 'should be have a property "body" which is a string and equals the sent text', function () {
          results.forEach(function (entry) {
            entry.should.have.property('body').which.is.a.String();
            entry.body.should.equal('hello folks!');
          });
        });

        it ( 'should be have a property "type" which is a string and equals the sent type', function () {
          results.forEach(function (entry) {
            entry.should.have.property('type').which.is.a.String();
            entry.type.should.equal(res._headers['content-type']);
          });
        });

        it ( ' - entry which has a property touched which is a number which, when resolved to date, is less than 2 seconds from now', function () {
          results.forEach(function (entry) {
            Number(entry.touched).should.be.a.Number();

            var date = new Date(Number(entry.touched));

            ( (Date.now() - date) ).should.be.below(2000);
          });
        });

        it ( ' - entry which has a property expire which equals sent expire', function () {
          results.forEach(function (entry) {
            should(+entry.expire).equal(_expire);
          });
        });
      });
    });
  });
  describe ( 'binaryroute', function () {

    var middleware, error, results;

    it ( 'should be a function', function () {
      cache.route.should.be.a.Function();
    });

    it ( 'should return a function', function () {
      middleware = cache.route({name: 'binary', expire: _expire, binary: true});
      middleware.should.be.a.Function();
    });

    describe('On Calling the route', function () {

      it ( 'should call next', function (done) {
        middleware(
          req,
          res,
          function (error) {
            if ( error ) {
              throw error;
            }

            res.send(new Buffer('hello folks!', 'binary'));
            done();
          });
      });

      it ( 'should have created the cache entry', function (done) {
        cache.get('binary', function (error, $results) {
          if ( error ) {
            throw error;
          }
          $results.length.should.be.above(0);
          results = $results;
          done();
        });
      });

      describe ( 'cache entry', function () {

        it ( 'should be have a property "body" which is a base64 string and decodes to sent text', function () {
          results.forEach(function (entry) {
            entry.should.have.property('body').which.is.a.String();
            entry.body.should.equal('aGVsbG8gZm9sa3Mh'); //aGVsbG8gZm9sa3Mh = 'hello folks!' in base64
            var decodedString = new Buffer(entry.body, 'base64').toString('utf8');
            decodedString.should.equal('hello folks!');
          });
        });

        it ( 'should be have a property "type" which is a string and equals the sent type', function () {
          results.forEach(function (entry) {
            entry.should.have.property('type').which.is.a.String();
            entry.type.should.equal(res._headers['content-type']);
          });
        });

        it ( ' - entry which has a property touched which is a number which, when resolved to date, is less than 2 seconds from now', function () {
          results.forEach(function (entry) {
            Number(entry.touched).should.be.a.Number();

            var date = new Date(Number(entry.touched));

            ( (Date.now() - date) ).should.be.below(2000);
          });
        });

        it ( ' - entry which has a property expire which equals sent expire', function () {
          results.forEach(function (entry) {
            should(+entry.expire).equal(_expire);
          });
        });
      });
    });
  });
})();

/**

  Basic smoke test for method cache.route()
  #########################################

  Called by `test/test.js`

  # Abstract

  Expecting `test/test.js` to call this file and bind it with a `(require('express-redis-cache')())` instance.

  This instance should have an array property called `caches` which represent the entries that have been created when `test/test.js` is called. We use these entries to verify we can perform a basic smoke-test on method `cache.route()`.


**/

module.exports = function (cb) {

  if ( typeof cb !== 'function' ) {
    throw new Error('Missing callback');
  }

  var cache = this;

  var domain = require('domain').create();

  var cacheEntry = '/path';

  domain.on('error', function (error) {
    cb(error);
  });

  domain.run(function () {

    var assert = require('./assert');

    require('async').parallel(
      /* for each new cache **/
      cache.newCaches

        /** if it is  a route cache */
        .filter(function (entry) {
          return !!( /^\/route_/.test(entry.name) );
        })

        .map(function (entry) {
          return function (then) {
            var name = this.name;
            var entry = this.entry;

            console.log();
            console.log(' Testing cache.route'.bold.blue, name, entry);
            console.log();

            /** Emulate req **/
            var req = {
              path: name
            };

            /** Emulate res **/
            var res = {
              statusCode: 200,
              send: function (body) {
                assert('it should be the same message', body === entry.body);

                then();
              }
            };

            /** Emulate next **/
            var next = function () {
              assert('There should be a response variable', !!res.expressRedisCache);

              res.send(entry.body);
            };

            var router = cache.route();

            assert('it should be a function', typeof router === 'function');

            /** Emulate a HTTP request **/

            router.apply(cache, [req, res, next]);

          }.bind(entry);
        }),

      cb);

  });
};
