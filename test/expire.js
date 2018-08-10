(function () {
  'use strict';

  var mocha     =   require('mocha');
  var should    =   require('should');

  var createExpirationPolicy = require('../lib/ExpressRedisCache/expire');

  describe ( 'expire', function () {

    it ( 'should be a function', function () {
      createExpirationPolicy.should.be.a.Function;
    });

    it ( 'should accept a number', function () {
      createExpirationPolicy(1).should.be.a.Function;
    });

    it ( 'should accept an object', function () {
      createExpirationPolicy({
          'xxx': -1,
        }).should.be.a.Function;
    });

    it ( 'should require an argument', function () {
      createExpirationPolicy.should.throw();
    });

    it ( 'should not accept a boolean', function () {
      (function () {
        createExpirationPolicy(true);
      }).should.throw();
    });

    it ( 'should require a default (xxx) expiration', function () {
      (function () {
        createExpirationPolicy({
          '1xx': 1,
          '2xx': 2
        });
      }).should.throw();
    });

    it ( 'should only accept two orders of wildcards', function () {
      (function () {
        createExpirationPolicy({
          'xxx': -1,
          '33x': 1
        });
      }).should.throw();
    });

    it ( 'should only accept number values for status code specific values', function () {
      (function () {
        createExpirationPolicy({
          'xxx': -1,
          '33x': true
        });
      }).should.throw();
    });

    it ( 'should only accept valid status code keys', function () {
      (function () {
        createExpirationPolicy({
          'xxx': -1,
          '6xx': 1
        });
      }).should.throw();
      (function () {
        createExpirationPolicy({
          'xxx': -1,
          '600': 1
        });
      }).should.throw();
      (function () {
        createExpirationPolicy({
          'xxx': -1,
          '6': 1
        });
      }).should.throw();
    })

    it ( 'should return the specified value for all status codes', function () {
      createExpirationPolicy(-1)(null, { statusCode: 200 }).should.equal(-1);
      createExpirationPolicy(1)(null, { statusCode: 300 }).should.equal(1);
      createExpirationPolicy(22)(null, { statusCode: 403 }).should.equal(22);
      createExpirationPolicy(333)(null, { statusCode: 404 }).should.equal(333);
      createExpirationPolicy(4444)(null, { statusCode: 500 }).should.equal(4444);
    });

    it ( 'should return the appropriate value for status codes', function () {
      var policy = createExpirationPolicy({
        'xxx': -1,
        '1xx': 1,
        '100': 100,
        '2xx': 2,
        '200': 200,
        '4xx': 4,
        '400': 400,
        '403': 403,
        '404': 404,
        '5xx': 5,
        '500': 500
      });
      policy(null, { statusCode: 500 }).should.equal(500);
      policy(null, { statusCode: 501 }).should.equal(5);
      policy(null, { statusCode: 404 }).should.equal(404);
      policy(null, { statusCode: 403 }).should.equal(403);
      policy(null, { statusCode: 400 }).should.equal(400);
      policy(null, { statusCode: 480 }).should.equal(4);
      policy(null, { statusCode: 200 }).should.equal(200);
      policy(null, { statusCode: 201 }).should.equal(2);
      policy(null, { statusCode: 100 }).should.equal(100);
      policy(null, { statusCode: 101 }).should.equal(1);
      policy(null, { statusCode: 300 }).should.equal(-1);
    });

    it ( 'should treat status code keys as case insensitive', function () {
      var policy = createExpirationPolicy({
        '1XX': 1,
        'xXx': 55
      });
      policy(null, { statusCode: 101 }).should.equal(1);
      policy(null, { statusCode: 200 }).should.equal(55);
    });
  });
})();
