"use strict";
var debugEnabled = require("../../config").debug;
var log = require("color-logs")(debugEnabled, debugEnabled, __filename);

var bcrypt = require("bcrypt-nodejs");
var mongoose = require("mongoose") //.set('debug', debugEnabled);
var Schema = mongoose.Schema;

var sch = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },
  password: {
    type: String,
    select: false,
    required: true
  },
  role: {
  	type: String,
  	enum: ['user', 'manager', 'admin'],
  	default: 'user',
  	required: true,
  },
  active: {
    type: Boolean,
    default: true,
    required: true,
  },
}, {
  timestamps: true
});

// Pre-save of user to database, hash password if password is modified or new
sch.pre("save", function (next) {
  var user = this,
      SALT_FACTOR = 5;

  if(!this.isModified("password")) next();

  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(this.password, salt, null, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next(null, this);
    });
  });
});

sch.methods.checkPassword = function(pwd) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(pwd, this.password, (err, passwordOK) => {
      if (err) {
        log.error(err);
        reject(err); 
      }
      resolve(passwordOK);
    });
  });
};


module.exports = mongoose.model("User", sch, "Users");
