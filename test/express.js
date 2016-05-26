// var path      =   require('path');
var assert    =   require('assert');

var mocha     =   require('mocha');
var should    =   require('should');
var request   =   require('request');
var util      =   require('util');
var supertest =   require('supertest');
var request;

describe ( 'test with small express server', function () {

  before(function (done) {
    this.timeout(5000);
    request = supertest(require('../express/server'));
    done();
  });

  it ( 'should have a / route', function (done) {
    request
      .get('/')
      .end(
        function (error, response, body) {
          if ( error ) {
            throw error;
          }
          response.statusCode.should.equal(200);
          done();
        }
    );
  });

  it ( 'should not have /foobar route', function (done) {
    request
      .get('/foobar')
      .end(function (error, response) {
        if ( error ) {
          throw error;
        }
        response.statusCode.should.equal(404);
        done();
      });
  });

  it ( '/1sec route should return json with a timestamp property', function (done) {
    var url = '/1sec';
    request.get(url)
      .end(function (error, response) {
        if ( error ) {
          throw error;
        }

        // Some Mocha weirdness requires a try/catch
        // or an AssertionError will crash the mocha process on error
        try {
          response.statusCode.should.equal(200);
          should(response.body).have.property('timestamp');
          done();
        } catch (e) {
          done(e);
        }
      });
  });

  it ( '/default_expire route should return json with a timestamp property', function (done) {
    var url = '/default_expire';
    request.get(url)
      .end(function (error, response) {
        if ( error ) {
          throw error;
        }

        // Some Mocha weirdness requires a try/catch
        // or an AssertionError will crash the mocha process on error
        try {
          response.statusCode.should.equal(200);
          should(response.body).have.property('timestamp');
          done();
        } catch (e) {
          done(e);
        }
      });
  });

  it ( '/never_expire route should return json with a timestamp property', function (done) {
    var url = '/never_expire';
    request.get(url)
      .end(function (error, response) {
        if ( error ) {
          throw error;
        }

        // Some Mocha weirdness requires a try/catch
        // or an AssertionError will crash the mocha process on error
        try {
          response.statusCode.should.equal(200);
          should(response.body).have.property('timestamp');
          done();
        } catch (e) {
          done(e);
        }
      });
  });

  it ( '/1sec route data should expire after 1 seconds', function (done) {
    setTimeout(function () {
      var url = '/1sec';
      request.get(url)
        .end(function (error, response) {
          if ( error ) {
            throw error;
          }
          var p_body = JSON.parse(response.text),
              timestamp = p_body.timestamp,
              now_timestamp = Math.floor(Date.now() / 1000);

          // Some Mocha weirdness requires a try/catch
          // or an AssertionError will crash the mocha process on error
          try {
            response.statusCode.should.equal(200);
            timestamp.should.be.above(now_timestamp - 1);
            done();
          } catch (e) {
            done(e);
          }
        });
    }, 1100);
  });



  it ( '/default_expire route data should expire after 3 seconds', function (done) {
    this.timeout(4000); // allow 5 secs to execute
    setTimeout(function () {
      var url = '/default_expire';
      request.get(url)
        .end(function (error, response) {
          if ( error ) {
            throw error;
          }
          var p_body = JSON.parse(response.text),
              timestamp = p_body.timestamp,
              now_timestamp = Math.floor(Date.now() / 1000);

          // Some Mocha weirdness requires a try/catch
          // or an AssertionError will crash the mocha process on error
          try {
            response.statusCode.should.equal(200);
            timestamp.should.be.above(now_timestamp - 3);
            done();
          } catch (e) {
            done(e);
          }
        });
    }, 3100);
  });

  it ( '/never_expire route data should not expire after 3 seconds', function (done) {
    this.timeout(4000); // allow 5 secs to execute
    setTimeout(function () {
      var url = '/never_expire';
      request.get(url)
        .end(function (error, response) {
          if ( error ) {
            throw error;
          }
          var p_body = JSON.parse(response.text),
              timestamp = p_body.timestamp,
              now_timestamp = Math.floor(Date.now() / 1000);

          // Some Mocha weirdness requires a try/catch
          // or an AssertionError will crash the mocha process on error
          try {
            response.statusCode.should.equal(200);
            timestamp.should.be.below(now_timestamp - 3);
            done();
          } catch (e) {
            done(e);
          }
        });
    }, 3100);
  });

  it ( '/never_expire/delete route data should be deleted', function (done) {
    var url = '/delete_never_expire';
    request.get(url)
      .end(function (error, response) {
        if ( error ) {
          throw error;
        }
        // Some Mocha weirdness requires a try/catch
        // or an AssertionError will crash the mocha process on error
        try {
          response.statusCode.should.equal(200);
          should(response.text).equal("count:1");
          done();
        } catch (e) {
          done(e);
        }
      });
  });

});
