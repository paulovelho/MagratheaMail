"use strict";
var debugEnabled = require("../../config").debug;
var log = require("color-logs")(debugEnabled, debugEnabled, __filename);

var jwt = require("jsonwebtoken");
var User = require('../users/model');
var baseApi = require("../../api");

class AuthenticationApi extends baseApi {

  createJwt(payload, expiration) { // 86400 = 24 hours expires
    let jwtSecret = require("../../config").jwtSecret;
    log.info("jwt", jwtSecret);
    if(expiration) {
      return jwt.sign(payload, jwtSecret, { expiresIn: expiration });
    } else {
      return jwt.sign(payload, jwtSecret);
    }
  }

  createJwtFromUser(user) {
      let expiration = 86400;
      return this.createJwt({
        user: user.email,
        user_id: user.id,
        role: user.role, 
      }, expiration);
  }

  // authentication routes:
  async access (req, res) {
    let email = req.body.email;
    let password = req.body.password;

    try {
      let user = await User.findOne({ email: email }, "+password");
      if (!user) {
        return this.fail(res, 401, "User not found!");
      }

      let valid = await user.checkPassword(password);
      if (!valid) {
        return this.fail(res, 301, "Password does not match");
      }

      user.password = null;
      let token = this.createJwtFromUser(user);
      return this.success(res, {
      	user: user,
        token: token,
        expires: Math.floor(Date.now() / 1000) + (86400)
      });

    } catch(ex) {
      log.info("error: ", ex);
      return this.exception(res, ex);
    }
  }

  token (req, res) {
    try {
      let data = this.getToken(req, res);
      return this.success(res, data);
    } catch(ex) {
      return this.exception(res, ex);
    }
  }

}

module.exports = new AuthenticationApi();
