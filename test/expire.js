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
      createExpirationPolicy(-1)(200).should.equal(-1);
      createExpirationPolicy(1)(300).should.equal(1);
      createExpirationPolicy(22)(403).should.equal(22)
      createExpirationPolicy(333)(404).should.equal(333)
      createExpirationPolicy(4444)(500).should.equal(4444)
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
      policy(500).should.equal(500);
      policy(501).should.equal(5);
      policy(404).should.equal(404);
      policy(403).should.equal(403);
      policy(400).should.equal(400);
      policy(480).should.equal(4);
      policy(200).should.equal(200);
      policy(201).should.equal(2);
      policy(100).should.equal(100);
      policy(101).should.equal(1);
      policy(300).should.equal(-1);
    });

    it ( 'should treat status code keys as case insensitive', function () {
      var policy = createExpirationPolicy({
        '1XX': 1,
        'xXx': 55
      });
      policy(101).should.equal(1);
      policy(200).should.equal(55);
    });
  });
})();