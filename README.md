express-redis-cache
===================

A module to make Express interact with Redis (create, get, delete). You can automatically cache all your most popular routes in Redis.

# Install

    npm install -g express-redis-cache
    
# Automatically cache a route

Just use it as a middleware in your route.

    var cache = require('express-redis-cache')();

    // replace
    app.get('/',
        function (req, res)  { ... });
    
    // by
    app.get('/',
        cache.route('home'),
        function (req, res)  { ... });
    
This will check if there is a cache entry in Redis named 'home'. If there is, it will display it. If not, it will record the response and save it as a new cache entry in Redis - so that next time this route is called, it will be cached.

# Redis connexion info

By default, redis-express-cache connects to Redis using localhost as host and nothing as port (using Redis default port). To use different port or host, declare then when you require express-redis-cache.

    var cache = require('express-redis-cache')({
        host: String, port: Number
        });
        
You can pass a Redis client as well:

    require('express-redis-cache')({ client: RedisClient })
    
# Commands

## Use a middleware
    
    cache.route( String name?, Number expires_at? )
        
    
If `name` is a string, it is a cache entry name. If it is null, it will use `req.path` as the entry name.

    app.get('/', cache.route('home'), require('./routes/'))
    // will look for a cache entry named 'home'
    
    app.get('/about', cache.route(), require('./routes/'))
    // will look for a cache entry named '/about'
    
## Set an expiration date for the cache entry

    cache.route('home', +new Date() + ( 1000 * 60 * 5 ));
    // cache will expire in 5 minutes
    
## The Entry object

    Object Entry {
        body: String // the content of the cache
        touched: Date // last time cache was set (created or updated)
    }

## The CacheOptions Object

    Object CacheOptions {
        expires_at: Number
    }


## Get the list of all cache entries
    
    cache.ls( Function ( Error?, [Entry] ) )
    
Feed a callback with an array of the cache entry names.
    
## Get a single cache entry by name
    
    cache.get( String name, Function( Error ?, Entry ) )
    
## Add a new cache entry
    
    cache.add( String name, String body, Object CacheOptions?, Function( Error?, Entry ) )

## Delete a cache entry
    
    cache.del( String name, Function ( Error?, Boolean success, Boolean notFound? ) )
    
# Command line

We ship with a CLI. You can invoke it like this: `express-redis-cache`
