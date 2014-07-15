express-redis-cache
===================

A light cache system with redis for express

# Install

    npm install -g express-redis-cache
    
# Init

    express-redis-cache init
    
# Require it in your express file

    var redisCache = require('express-redis-cache');

    // get from cache
    app.get('/', redisCache.get, require('./routes/home'));
    
    // create it if not exists
    app.get('/', redisCache.get(true), require('./routes/home'));
    
# 
