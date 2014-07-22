express-redis-cache
===================

A light cache system with redis for express

# Install

    npm install -g express-redis-cache
    
# Usage in Node

    var expressRedisCache = require('express-redis-cache');
    
# Get a cache entry

    expressRedisCache.get('name-of-cache-entry', function (error, cache) {
        if ( error ) {
            throw error;
        }
        assert(cache, instanceof Object);
        assert(cache.body, instanceof String);
        assert(cache.touched, instanceof Date);
    });
    
# Create a new cache entry

    expressRedisCache.add('name-of-cache-entry', function (error, cache) {
        if ( error ) {
            throw error;
        }
        assert(cache, instanceof Object);
        assert(cache.body, instanceof String);
        assert(cache.touched, instanceof Date);
    });
    
# Delete a cache entry

    expressRedisCache.del('name-of-cache-entry', function (error) {
        if ( error ) {
            throw error;
        }
    });
    
# Automatically cache a route

Just use it as a middleware in your route.

    // replace
    app.get('/', require('./routes/index'));
    // by
    var cacheEntryName = '/home';
    app.get('/', expressRedisCache.middleware(cacheEntryName), require('./routes/index'));
    
This will check if there is a cache entry in Redis named after cacheEntryName. If there is, it will display it. If not, it will record the response and save it as a new cache entry in Redis.

# Redis connexion info

By default, redis-express-cache connects to Redis using localhost as host and nothing as port (using Redis default port). To use different port or host, use:

    expressRedisCache.host('host name or IP address');
    expressRedisCache.port('some port number');
    
# Commands

## Get the list of all cache entries
    
    expressRedisCache.ls
        
        [Object | Null options]
        
        Function callback
            
            Error | Null error
            
            Array entries
    
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
