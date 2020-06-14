"use strict";

var mongoUrl = process.env.MONGO_URL;
var jwtKey = process.env.JWT_SECRET;
var debug = process.env.DEBUG_API || true;

module.exports = {
	debug: debug,
	dbHost: mongoUrl,
//	dbHost: "mongodb://botecaria:0rm3n1@botecaria_mongodb:27017/",
	bucket: 'magrathea-contacts',
	jwtSecret: jwtKey,
};
