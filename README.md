express-redis-cache
===================

A light cache system with redis for express

# Install

    npm install -g express-redis-cache
    
# Init

    # Follow prompts
    express-redis-cache init
    
# Create a new cache entry

    express-redis-cache add <cache-entry-name> <path> [<options...>]
    
Create a new cache entry. It will fetch with a HTTP request the page using &lt;path> and save it in redis under `erc<cache-entry-name>`

    express-redis-cache add home /
    
    # Headers
    
    express-redis-cache add somepage / Content-Type:'text/html; charset=utf-8' User-Agent:JamesBond/v0.0.7
    
    # Post
    
    express-redis-cache add /login --data id=1234&email=joe@doe.com
    
# View cache

    express-redis-cache ls
    
# Remove a cache entry

    express-redis-cache del <cache-entry-name>
    
# Use it in your express file

    var redisCache = require('express-redis-cache');

    // replace
    app.get('/', require('./routes/home'));
    
    // by
    redisCache.get('/', require('./routes/home'));
    
    // apply only to production
    ( app.get('env') === 'production' ? redisCache : app ).get('/', require('./routes/home'));
    
Basically this will look for a matching cache entry and return it. If no match is found, it will call the route callback function (the first argument) and cache the response.
    
# View pages cached

    express-redis-cache view
    
# Reload a page

    express-redis-cache reload <page>
    
# Remove a page

    express-redis-cache remove <page>
