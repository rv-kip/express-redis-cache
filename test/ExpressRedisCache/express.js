(function () {

  'use strict';

  var path      =   require('path');
  var assert    =   require('assert');

  var mocha     =   require('mocha');
  var should    =   require('should');
  var request   =   require('request');
  var util      =   require('util');

  var config    =   require('../../package.json').config;

  var prefix    =   'erct:';
  var host      =   'localhost';
  var port      =   6379;

  var spawn,
      express_port,
      home;

  describe ( 'test with small express server', function () {

    before(function (done) {

      spawn = require('child_process')
        .spawn('express/server.js', [], {});

      spawn.on('error', function (error) {
        throw error;
      });

      spawn.on('exit', function (status) {
        console.log('Express Server exit with status ' + status);
      });

      spawn.stdout.on('data', function (data) {
        console.log(data.toString());
        if ( /express-redis-cache test server started on port/.test(data.toString()) ) {

          express_port = data.toString().split(' ').pop().trim();

          done();
      }
      });
    });

    it ( 'should have a / route', function (done) {
      request('http://localhost:' + express_port,
        function (error, response, body) {
          if ( error ) {
            throw error;
          }
          home = body;
          done();
        });
    });

    it ( '/ route should be cached', function (done) {
      request('http://localhost:' + express_port,
        function (error, response, body) {
          if ( error ) {
            throw error;
          }
          home = body;
          done();
        });
    });

    it ( '/3sec route should return a json object', function (done) {
      var url = 'http://localhost:' + express_port + "/3sec";
      request(url,
        function (error, response, body) {
          if ( error ) {
            throw error;
          }
          var p_body = JSON.parse(body);
          p_body.should.have.property('timestamp');
          done();
        });
    });

    it ( '/3sec route expire after 3 seconds', function (done) {
      this.timeout(3000);
      var url = 'http://localhost:' + express_port + "/3sec";
      request(url,
        function (error, response, body) {
          if ( error ) {
            throw error;
          }
          var p_body = JSON.parse(body),
              timestamp = p_body.timestamp,
              now_timestamp = Math.floor(Date.now() / 1000);

          timestamp.should.be.above(now_timestamp - 3);
          done();
        });
    });


    this.timeout(100000);
    after(function (done) {
      process.kill(spawn.pid);
      done();
    });

  });

})();