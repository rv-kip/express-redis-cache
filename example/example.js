var app = require('express')(),
    cache = require('../')({ expire: 5 });

cache.on('message', function(message){
  console.log("cache", message);
});

cache.on('error', function(error){
  console.error("cache", error);
});

var port = 3000;
app.listen(port);
console.log("Server listening on http://localhost:" + port);

// Serve simple page with timestamp cached for 5 seconds
app.get('/:skip_cache?',
  cache.route(),
  function (req, res)  {
  	if (req.params.skip_cache) {
  		res.use_express_redis_cache = false;
  		console.log ("Cache disabled on this request");
  	}

    var currTime = new Date();
    res.send("Date and time: " + currTime);
});