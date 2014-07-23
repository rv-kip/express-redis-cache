#! /usr/bin/env node

/**

  express-redis-cache cli api
  ##########################

  # Run

      express-redis-cache

  # Help

      express-redis-cache help

**/

require('colors');

var package = require('../package.json');

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

  var cache = require('../')({
    host: host,
    port: port,
    prefix: prefix || package.config.prefix
  });

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
      console.log('    %s     %s', 'expires'.yellow,
        (function () {
          if ( entry.expire < 0 ) {
            return 'NEVER';
          }
          else {
            var expire = ( +entry.touched + (+entry.expire * 1000));

            var iso2 = new Date(expire).toISOString();

            return moment(iso2, moment.ISO_8601).fromNow();
          }
        })());

      /** Object size in bytes **/
      console.log('    %s       %s bytes ' + '%s MB'.grey,
        'size'.yellow,
        require('../lib/sizeof')(entry),
        (require('../lib/sizeof')(entry) / 1048576).toFixed(2));
      
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
      cache.client.quit();

      console.log(' express-redis-cache v%s'.yellow, package.version);
      console.log();
      console.log(' Cache the response of a HTTP request inside a Redis list and let you manage your cache entries'.cyan);
      console.log();
      console.log(' Commands:');
      console.log();
      
      console.log('  ls'.bold.cyan);
      console.log('    View cache entries');
      console.log();
      
      console.log('  add <name> <content>'.bold.cyan);
      console.log('    Add a new cache entry');
      console.log('     express-redis-cache add favorite-movie titanic'.magenta);
      console.log();
      
      console.log('  del <name>'.bold.cyan);
      console.log('    Delete a cache entry');
      console.log('     express-redis-cache del favorite-movie'.magenta);
      console.log();

      console.log(' NOTE'.bold.yellow);
      
      console.log(' express-redis-cache connects to Redis using localhost as default and Redis default port. You can override that with the options: --port <port> --host <host>.'.cyan);

      console.log();
      
      break;

    /**
      LS
    **/

    case 'ls':
      
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
      ADD
    **/

    case 'add':
      if ( ! process.argv[3] || ! process.argv[4] ) {
        throw new Error('Missing arguments');
      }

      cache.add(process.argv[3], process.argv[4], +process.argv[5], domain.intercept(function (name, entry) {

        cache.client.quit();

        entry.name = name;

        formatEntry(entry);
      }));
      break;

    /**
      DEL
    **/

    case 'del':
      cache.del(process.argv[3], domain.intercept(function (occ) {

        cache.client.quit();

        console.log(' %d deletions', occ);
      }));
      break;

    /**
      GET
    **/

    case 'get':
      cache.get(process.argv[3], domain.intercept(function (entry) {
        
        cache.client.quit();

        entry.name = process.argv[3];

        formatEntry(entry);

        console.log();
        console.log(entry.body.grey);
        console.log();
      
      }));
      break;
  }
});