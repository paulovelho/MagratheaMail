"use strict";
var log = require("color-logs")(true, true, __filename);
var mongoose = require("mongoose");
mongoose.set('useUnifiedTopology', true);

module.exports = (req, res, next) => {
  log.info("connecting to mongo");
  let config = require('../config');
  let host = config.dbHost;
  let bucket = config.bucket;

  if(!bucket) {
    log.error(500, "Impossible to connect to mongo: empty bucket");
  }
  let mongoConn = host + bucket;
  log.info("connecting into " + mongoConn);
  mongoose.connect(mongoConn, { useNewUrlParser: true, useCreateIndex: true });

  var close = () => {
    log.info("mongoose closing connection");
    mongoose.connection.close() 
  }

  process.on('SIGINT', close);
  process.on('SIGTERM', close);

	next();
};
