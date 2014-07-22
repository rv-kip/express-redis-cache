express-redis-cache
===================

A module to make Express interact with Redis (create, get, delete). You can automatically cache all your most popular routes in Redis.

# Install

    npm install -g express-redis-cache
    
# Automatically cache a route

Just use it as a middleware in your route.

    var cache = require('express-redis-cache');

    // replace
    app.get('/',
        function (req, res)  { ... });
    
    // by
    app.get('/',
        cache.route('home'),
        function (req, res)  { ... });
    
This will check if there is a cache entry in Redis named 'home'. If there is, it will display it. If not, it will record the response and save it as a new cache entry in Redis - so that next time this route is called, it will be cached.

# Redis connexion info

By default, redis-express-cache connects to Redis using localhost as host and nothing as port (using Redis default port). To use different port or host, use:

    cache.host('host name or IP address');
    cache.port('some port number');
    
# Commands

## Get the list of all cache entries
    
    expressRedisCache.ls(
        
        [Object | Null options] ,
        
        Function callback(
            
            Error | Null error,
            
            Array entries
        )
    )
    
## Get a single cache entry by name
    
    expressRedisCache.get
    
        String name
        
        Function callback
            
            Error | Null error
            
            Object entry
    
## Add a new cache entry
    
    expressRedisCache.add
    
        String name
        
        String body
        
        Function callback
        
            Error | Null error
            
            Object entry


    
# Command line

We ship with a CLI. You can invoke it like this: `express-redis-cache`
