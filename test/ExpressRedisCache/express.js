(function () {
  
  'use strict';

  var path      =   require('path');
  var assert    =   require('assert');

  var mocha     =   require('mocha');
  var should    =   require('should');
  var request   =   require('request');

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
        throw new Error('Server exit with status ' + status);
      });

      spawn.stdout.on('data', function (data) {
        if ( /express-redis-cache test server started on port/.test(data.toString()) ) {

          express_port = data.toString().split(' ').pop();

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

    after(function () {
      process.kill(spawn.pid);
    });

  });

})();