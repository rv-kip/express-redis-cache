#!/usr/bin/env node

module.exports = (function () {

  'use strict';

  require('colors');

  var pkg = require('../package.json');

  var domain = require('domain').create();

  domain.on('error', function (error) {
    throw error;
  });

  domain.run(function () {

    /** Get configuration from command line if any **/

    var port, host, prefix, skip = [];

    process.argv = process.argv.map(function (argv, i, all) {
      if ( argv === '--prefix' && process.argv[(i + 1)] ) {
        prefix = process.argv[(i + 1)];
        skip.push(i + 1);
      }

      else if ( argv === '--port' && process.argv[(i + 1)] ) {
        port = process.argv[(i + 1)];
        skip.push(i + 1);
      }

      else if ( argv === '--host' && process.argv[(i + 1)] ) {
        host = process.argv[(i + 1)];
        skip.push(i + 1);
      }

      else if ( skip.indexOf(i) === -1 ) {
        return argv;
      }
    });

    skip = undefined;

    /** Iniatilize express-redis-cache **/

    var cache;

    function connect () {
      cache = require('../')({
        host: host,
        port: port,
        prefix: prefix || pkg.config.prefix
      });

      cache

        .on('error', function (error) {
          error.stack.split(/\n/).forEach(function (line) {
            console.log(line.yellow);
          });
        })

        .on('message', function (message) {
          console.log(message.grey);
        });
    }

    /** A function to pretty print a cache entry **/

    function formatEntry (entry) {
      try {
        var moment = require('moment');

        var iso = new Date(+entry.touched).toISOString();

        /** Name **/
        console.log('  ' + entry.name.blue.bold);

        /** Touched **/
        console.log('    %s    %s', 'touched'.yellow,
          moment(iso, moment.ISO_8601).fromNow());

        /** Expire **/
        console.log('    %s    %s', 'expires'.yellow,
          (function () {
            if ( entry.expire < 0 || typeof expire === 'undefined' ) {
              return 'NEVER';
            }
            else {
              var expire = ( +entry.touched + ((+entry.expire || 0) * 1000));

              var iso2 = new Date(expire).toISOString();

              return moment(iso2, moment.ISO_8601).fromNow();
            }
          })());

        /** Object size in bytes **/
        console.log('    %s       %s bytes ' + '%s KB'.grey,
          'size'.yellow,
          require('../lib/sizeof')(entry),
          (require('../lib/sizeof')(entry) / 1024).toFixed(2));

        /** Body length **/
        console.log('    %s       %s', 'body'.yellow, entry.body.length +
          ' characters');
      }
      catch ( error ) {
        return console.log('  Not readable'.red, entry, error);
      }
    }

    /** Switch action **/

    switch ( process.argv[2] ) {

      /**
        HELP
      **/

      case undefined:
      case '-h':
      case '--help':
      case 'help':

        console.log(' express-redis-cache v%s'.yellow, pkg.version);
        console.log();
        console.log(' Cache the response of a HTTP request inside a Redis list and let you manage your cache entries'.cyan);
        console.log();
        console.log(' Commands:');
        console.log();

        console.log('  add <name> <content> <expire> --type=<type>'.bold.yellow);
        console.log('    Add a new cache entry');
        console.log('     # Cache simple text');
        console.log('     express-redis-cache add "test" "This is a test";'.cyan);
        console.log('     # Cache a file');
        console.log('     express-redis-cache add "home" "$(cat index.html)";'.cyan);
        console.log('     # Cache a JSON object');
        console.log("     express-redis-cache add \"user1:location\" '{ \"lat\": 4.7453, \"lng\": -31.332 }' --type json;".cyan);
        console.log('     # Cache a text that will expire in one hour');
        console.log('     express-redis-cache add "offer" "everything 25% off for the next hour" $(( 60 * 60 ));'.cyan);
        console.log();

        console.log('  get <name>'.bold.yellow);
        console.log('    Get a single cache entry by name');
        console.log('     # Get all cache entries for default prefix');
        console.log('     express-redis-cache get'.cyan);
        console.log();

        console.log('  del <name>'.bold.yellow);
        console.log('    Delete a cache entry');
        console.log('     express-redis-cache del favorite-movie'.cyan);
        console.log();

        console.log('  size'.bold.yellow);
        console.log('    Get cache size for all entries');
        console.log();

        console.log(' NOTE'.bold.yellow);

        console.log(' express-redis-cache connects to Redis using localhost as default and Redis default port. You can override that using the options: --port <port> --host <host>. Ditto for --prefix <prefix>.'.cyan);

        console.log();

        break;

      /**
        LS
      **/

      case 'ls':

        connect();

        cache.ls(domain.intercept(function (entries) {

          cache.client.quit();

          if ( ! entries.length ) {
            console.log(' [empty]'.grey);
          }
          else {
            entries.forEach(formatEntry);
          }

        }));
        break;

      /**
        SIZE
      **/

      case 'size':

        connect();

        cache.size(domain.intercept(function (size) {

          cache.client.quit();

          console.log('Size: %d bytes, %d KB, %d MB',
            size,
            (size / 1024).toFixed(2),
            (size / (1024 * 1024)).toFixed(2));

        }));
        break;

      /**
        ADD
      **/

      case 'add':
        if ( ! process.argv[3] || ! process.argv[4] ) {
          throw new Error('Missing arguments');
        }

        connect();

        cache.add(process.argv[3], process.argv[4], { expire: +process.argv[5] }, domain.intercept(function (name, entry) {

          cache.client.quit();

          entry.name = name;

          formatEntry(entry);
        }));
        break;

      /**
        DEL
      **/

      case 'del':

        connect();

        cache.del(process.argv[3], domain.intercept(function (occ) {

          cache.client.quit();

          console.log(' %d deletions', occ);
        }));
        break;

      /**
        GET
      **/

      case 'get':

        connect();

        cache.get(process.argv[3], domain.intercept(function (entries) {

          cache.client.quit();

          entries.forEach(function (entry) {
            formatEntry(entry);
          });

        }));
        break;
    }
  });

})();
