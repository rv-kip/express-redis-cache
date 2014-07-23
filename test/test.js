/**

  Basic smoke test of express-redis-cache
  #######################################

  # Run

      node test/test

  You can pass parameters:

      node test/test --host <redis host> --port <redis port> --prefix <prefix>

**/

require('colors');

var host, port;

/** In case it is called like this: `npm test --host=<redis host> --port=<redis port>` **/

if ( process.env.npm_config_host ) {
  host = process.env.npm_config_host;
}

if ( process.env.npm_config_port ) {
  port = process.env.npm_config_port;
}

/** Read command line arguments in any **/

process.argv.forEach(function (argv, i) {
  if ( argv === '--port' && process.argv[i+1] ) {
    port = +process.argv[i+1];
  }

  if ( argv === '--host' && process.argv[i+1] ) {
    host = +process.argv[i+1];
  }
});

/** Set a special prefix for tests */

var prefix = 'test_erc:';

console.log(' Creating testing database'.grey);

/** Creating a new Redis client **/

var client = require('redis').createClient(port, host);

var async = require('async');

/** The cache entries we will create in order to have something to ls and get **/

var caches = [
  {
    name: 'never_expires',
    entry: {
      body: 'This is a test',
      touched: +new Date(),
      expire: -1
    }
  },

  {
    name: 'expires_in_5_seconds',
    entry: {
      body: 'This is a test that expires in 5 seconds',
      touched: +new Date(),
      expire: 5
    }
  }
];

/** The cache entries to add **/

var newCaches = [
  {
    name: 'new_never_expires',
    entry: {
      body: 'This is a new test',
      touched: +new Date(),
      expire: -1
    }
  },

  {
    name: 'new_expires_in_5_seconds',
    entry: {
      body: 'This is a new test that expires in 5 seconds',
      touched: +new Date(),
      expire: 5
    }
  },

  {
    name: '/route_never_expires',
    entry: {
      body: 'This is a route test',
      touched: +new Date(),
      expire: -1
    }
  },

  {
    name: '/route_expires_in_5_seconds',
    entry: {
      body: 'This is a route that expires in 5 seconds',
      touched: +new Date(),
      expire: 5
    }
  }
];

async.parallel(
  
  /** Map a function to cache our test entries one by one */
  caches.map(function (c) {
    return function (cb) {
      client.hmset(
        prefix + this.name,

        this.entry,

        cb);
    }.bind(c);
  }),


  function (error) {

    if ( error ) {
      throw error;
    }

    /** Init express-redis-cache **/
    var cache = require('../')({
      port: port,
      host: host,
      prefix: prefix,
      client: client
    });

    /** Pass stuff to testers **/

    cache.caches = caches;
    cache.newCaches = newCaches;

    /** Run testers **/

    async.series(

      [
        ['ls', 'get', 'add', 'route'],
        ['del', 'expire']
      ]
        .map(function (command) {
          
          return function (cb) {
            async.parallel(command
              
              .map(function (action) {
                return require('./' + action).bind(cache);
              }),

              cb);
          };
        }),


      /** End of async operations **/
      
      function (error, results) {
        client.quit();

        if ( error ) {
          throw error;
        }
      });
  });

    