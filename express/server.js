#!/usr/bin/env node

var path = require('path');

/* ======== express  ======== */

var express       = require('express');
var app           = express();

app.set('port', process.env.PORT || 3027);

/* ======== cache  ======== */
var cache_options = {
  expire      : 3,
  host        : process.env.EX_RE_CA_HOST || 'localhost',
  port        : process.env.EX_RE_CA_PORT || 6379,
  prefix      : process.env.EX_RE_CA_PREFIX || 'erct:'
};

var cache         = require('../')(cache_options);
var moment        = require('moment');

cache.on('error', function (error) {
  console.log('cache error', {
    message: error.message
  });
});

/* ======== body parser  ======== */

var bodyParser    = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* ======== home  ======== */

function handle_timestamp (req, res) {
  res.set({'Content-Type': 'text/json'});
  var timestamp = { timestamp: moment().unix()};
  return res.json(timestamp);
}

// Cache the time for 1 second as
// { timestamp: 1424309866 }
app.all('/1sec',
    cache.route({expire: 1}),
    handle_timestamp
);

app.all('/default_expire',
    cache.route(),
    handle_timestamp
);

app.all('/never_expire',
    cache.route({expire: -1}),
    handle_timestamp
);

app.all('/delete_never_expire',
    function(req, res) {
      cache.del("/never_expire", function(err, count){
        if (err) {
          return res.send(500);
        }
        return res.send("count:" + count);
      });

    }
);
app.all('/',

  cache.route(),

	function (req, res) {
  	res.send('Now is ' + new Date());
	});

/* ======== server  ======== */

var server = require('http').createServer(app);

server.listen(app.get('port'), function () {
  console.log('express-redis-cache test server started on port ' + app.get('port'));
});

server.on('error', function (error) {
  console.log({ 'server error': error });
});
