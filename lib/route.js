/**

  cache.route()
  #############

  The route to be called from Express app

**/

module.exports = function (
/* String */      name,       // The cache entry name to get
/* Number */      expire      // The cache expiration     [OPTIONAL]
) { 

  /** The middleware function to return **/
  var fn;

  var self = this;

  var domain = require('domain').create();

  domain.on('error', function (error) {
    throw error;
  });

  domain.run(function () {
      
    fn = function (req, res, next) {

      name = name || req.path;
      
      /** attempt to get page **/
      self.get(name, domain.intercept(function (cache) {
        
        /** if it's cached, display cache **/
        if ( cache && cache.constructor === Object && Object.keys(cache).length ) {
          console.log('Using cache: ' + name);
          res.send(cache.body);
        }

        /** otherwise, cache request **/
        else {

          /** wrap res.send **/
          var send = res.send.bind(res);

          res.expressRedisCache = true;

          res.send = function (body) {

            /** send output to HTTP client **/

            send(body);

            if ( this.expressRedisCache ) {
              /** Create the new cache **/
              self.add(name, body, expire,
                domain.intercept(function (name, cache) {
                  console.log('Created cache for ' + name);
                }));
            }
          };

          next();
        }

      }));
    };

  });

  return fn;
};