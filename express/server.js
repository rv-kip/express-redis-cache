#!/usr/bin/env node

var path = require('path');

/* ======== express  ======== */

var express       = require('express');
var app           = express();

var cache					=	require('../')();

app.set('port', process.env.PORT || 3027);

/* ======== body parser  ======== */

var bodyParser    = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* ======== home  ======== */

app.get('/',

	cache.route(),

	function (req, res) {
  	res.sendFile(require('path').join(__dirname, 'index.html'));
	});

/* ======== server  ======== */

var server = require('http').createServer(app);

server.listen(app.get('port'), function () {
  console.log('express-redis-cache test server started on port ' + app.get('port'));
});

server.on('error', function (error) {
  console.log({ 'server error': 'error' });
});
