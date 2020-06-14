/*
	v. 2.1
	2020-06-08
	last change: add validation error
*/
"use strict";
var debugEnabled = require("./config").debug;
var log = require("color-logs")(debugEnabled, debugEnabled, __filename);

var jwt = require("jsonwebtoken");

class MagratheaApi {

	constructor() {
		this.req = null;
		this.res = null;
	}

	success(res, data) {
		if(!res) return;
		return res.status(200).send({
			success: true,
			data: data
		});
	}

	success_paginate(res, page, more, data) {
		if(!res) return;
		return res.status(200).send({
			success: true,
			page: page,
			has_more: more,
			data: data
		});
	}

	fail(res, code, message, data) {
		return res.status(200).send({
			success: false,
			code: code,
			message: message,
			data: data
		});
	}

	error(res, code, message, data) {
		return res.status(401).send({
			success: false,
			message: message,
			data: data,
		});
	}
	validationError(res, err) {
		let errors = []
		Object.keys(err.errors).map((errIndex) => {
				let e = err.errors[errIndex].properties;
				delete e.validator;
				errors[errIndex] = e;
			});
		let data = {
			fields: Object.keys(err.errors),
			errors: errors,
		}
		return this.error(res, 2005, "Validation Error", data);
	}
	exception(res, ex) {
		if(ex.name == "ValidationError") return this.validationError(res, ex);
		return res.status(500).send({
			success: false,
			data: ex
		});
	}

	permissionDenied(res) {
		return res.status(401).send("permission denied");
	}

	isAuthenticated(req, res, next) {
		let data = this.getToken(req, res);
		log.info("checking authentication of", data);
		if (data) {
			next();
		} else {
			return this.permissionDenied(res);
		}
	}

	getPage(req) {
		if(!req.query) return 0;
		let page = req.query.page;
		if(!page) page = 0;
		return page;
	}

	getToken(req, res) {
		let jwtSecret = require("./config").jwtSecret
		let token = req.headers['x-access-token'] || req.headers['authorization'];
		if(!token) {
			this.permissionDenied(res);
		}

		if (token.startsWith('Bearer ')) {
			// Remove Bearer from string
			token = token.slice(7, token.length);
		}

		if (token) {
			try {
				var decoded = jwt.verify(token, jwtSecret);
				return decoded;
			} catch(e) {
				log.error(e);
				if (e.name == "TokenExpiredError") {
					return this.fail(res, 4010, "Token Expired", {
						message: e.message,
						expiredAt: e.expiredAt
					});
				}
				log.error(e);
				return this.error(res, 401, "Token is not valid");
			}
		} else {
			return this.permissionDenied();
		}
	}

}

module.exports = MagratheaApi;
