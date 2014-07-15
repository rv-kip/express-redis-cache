express-redis-cache
===================

A light cache system with redis for express

# Install

    npm install -g express-redis-cache
    
# Init

    express-redis-cache init
    
# Require it in your express file

    if ( app.get('env') === 'production' ) {
      // enable cache for all HTTP requests to app
      app.use(require('express-redis-cache').all);
      
      // enable cache only for declared
    }
    
# 
