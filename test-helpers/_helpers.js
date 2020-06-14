"use strict";
var log = require("color-logs")(true, true, __filename);

var mongoose = require('mongoose');
var jwt = require("jsonwebtoken");

module.exports = {
	db_open: (done) => {
		let config = require('../config');
		let host = config.dbHost;
		let bucket = config.bucket;
		let mongoConn = host + bucket + "-test";
		mongoose.connect(mongoConn, { 
			useNewUrlParser: true, 
			useCreateIndex: true,
		}, () => {
			try {
				mongoose.connection.db.dropDatabase(done);
			} catch(ex) {
				log.error(ex);
				log.error("could not start mongo. is mongod running?");
				throw(ex);
			}
		});
	},
	db_close: (done) => {
		mongoose.connection.close(done);
	},
	create_auth: (data) => {
		let jwtSecret = require("../config").jwtSecret;
		return jwt.sign(data, jwtSecret);
	}
};
