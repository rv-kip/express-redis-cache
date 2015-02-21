#!/usr/bin/env node

var path = require('path');

/* ======== express  ======== */

var express       = require('express');
var app           = express();

app.set('port', process.env.PORT || 3027);

/* ======== cache  ======== */

var cache					=	require('../')();

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
