express-redis-cache
===================

A light cache system with redis for express

# Install

    npm install -g express-redis-cache
    
# Init

    # Follow prompts
    express-redis-cache init
    
# Require it in your express file

    var redisCache = require('express-redis-cache');

    // replace
    app.get('/', require('./routes/home'));
    
    // by
    redisCache.get('/', require('./routes/home'));
    
    // apply only to production
    ( app.get('env') === 'production' ? redisCache : app ).get('/', require('./routes/home'));
    
# View pages cached

    express-redis-cache view
    
# Reload a page

    express-redis-cache reload <page>
    
# Remove a page

    express-redis-cache remove <page>
