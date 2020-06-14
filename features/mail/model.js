"use strict";
var debugEnabled = require("../../config").debug;
var log = require("color-logs")(debugEnabled, debugEnabled, __filename);

var mongoose = require("mongoose") //.set('debug', debugEnabled);
var Schema = mongoose.Schema;

var sch = new Schema({
  email_to: {
    type: String,
    required: true
  },
  email_from: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },
  body: {
    type: String,
    select: false,
    required: true,
  },
  source: {
  	type: String
  },
  priority: {
  	type: Number,
  	default: 70,
  	required: true,
  },
  sent: {
    type: Boolean,
    default: false,
    required: true,
  },
  sent_date: {
  	type: Date,
  },
  attempts: {
  	type: Number,
  	default: 0,
  },

}, {
  timestamps: true
});


module.exports = mongoose.model("Mail", sch);
