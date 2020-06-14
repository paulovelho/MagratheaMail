"use strict";
var debugEnabled = require("../../config").debug;
var log = require("color-logs")(debugEnabled, debugEnabled, __filename);

var User = require('./model');
var BaseApi = require("../../api");

class UsersController extends BaseApi {

  async getUserById(id) {
    try {
      return await User.findById(id);
    } catch(ex) {
      throw ex;
    }
  }

  hasPermissionToCreate(caller) {
    return (caller.role == "admin" || caller.role == "manager");
  }
  hasPermissionToUpdate(user_id, caller) {
//    log.info("checking permission to update "+user_id, caller);
    if(user_id == caller.user_id) return true;
    if(caller.role == "admin") return true;
    if(caller.role == "manager") return true;
    return false;
  }

  getUser(req, res) {
    let id = req.params.id;
    this.getUserById(id)
      .then(model => this.success(res, model))
      .catch(err => this.exception(res, err));
  }

  async getUsers(req, res) {
    await User.find()
      .sort({ "name": 1 })
      .exec( (err, models) => {
        if (err) {
          log.error(err);
          return this.exception(res, err);
        }
        return this.success(res, models);
      });
  };

  async getMe(req, res) {
    let data = this.getToken(req, res);
    log.info("getting me of ", data);
    try {
      let user = await this.getUserById(data.user_id);
      if (!user) {
        return this.fail(res, 401, "You were not found!");
      }
      return this.success(res, user);
    } catch(ex) {
      return this.exception(res, ex);
    }
  }

  createUser(req, res) {
    let data = this.getToken(req, res);
    if(!data) return;

    if(!this.hasPermissionToCreate(data))
      return this.permissionDenied(res);
    var model = new User(req.body);
    return new Promise((resolve, reject) => {
      model.save((err, model) => {
        if (err) {
          log.error("save user error", err);
          this.exception(res, err);
          return reject(err);
        }
        this.success(res, model);
        return resolve(model);
      });
    })
  }

  updateUser(req, res) {
    var id = req.params.id;
    let data = this.getToken(req, res);
    if(!data) return;
    if(!this.hasPermissionToUpdate(id, data))
      return this.permissionDenied(res);

    User.updateOne({ _id: id }, req.body)
      .then((model) => {
        this.getUserById(id)
          .then(model => this.success(res, model))
          .catch(err => this.exception(res, err));
      })
      .catch(err => this.exception(res, err));
  }

  changePassword(req, res) {
    var id = req.params.id;
    let data = this.getToken(req, res);
    if(!data) return;
    if(!this.hasPermissionToUpdate(id, data))
      return this.permissionDenied(res);

    let newPassword = req.body.password;
    return this.getUserById(id)
      .then((user) => {
        user.password = newPassword;
        return user.save()
          .then((model) => {
            this.success(res, true);
          })
          .catch(err => this.exception(res, err));
      });
  }

  async deleteUser(req, res) {
    var id = req.params.id;
    let data = this.getToken(req, res);
    if(!data) return;
    if(!this.hasPermissionToUpdate(id, data))
      return this.permissionDenied(res);

    try {
      let user = await User.findById(id)
      await user.remove();
      return this.success(res, user);
    } catch(ex) {
      return this.exception(res, ex);
    }
  }

}

module.exports = new UsersController();
