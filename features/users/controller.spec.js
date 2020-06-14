"use strict";
var log = require("color-logs")(true, true, __filename);
var expect = require('chai').expect;
var sinon = require('sinon');
var Chance = require('chance');
var chance = new Chance();

var mocks = require('../../test-helpers/_mocks');
var helpers = require('../../test-helpers/_helpers');

var Model = require('./model');

describe('Users controller', () => {
	var controller;
	var sandbox;
	var onSuccess;

	before(done => helpers.db_open(done));
	after(done => helpers.db_close(done));

	beforeEach((done) => {
		this.sandbox = sinon.createSandbox();
		this.controller = require('./controller');
		this.onSuccess = this.sandbox.stub(this.controller, "success");
		done();
	});
	afterEach((done) => {
		this.sandbox.restore();
		done();
	});

	it('should create user', (done) => {
		let model = mocks.Users.getRandom();
		this.onSuccess.callsFake((res, data) => {
				expect(data.name).to.be.equal(model.name);
				expect(data._id).to.not.be.null;
				done();
		});
		this.controller.createUser({
			body: model,
			headers: { authorization: helpers.create_auth({ role: "manager" }) },
		}, null);
	});

	it('should not create a user if not a manager', (done) => {
		let model = mocks.Users.getRandom();
		let permissionDenied = this.sandbox.stub(this.controller, "permissionDenied");
		this.controller.createUser({
			body: model,
			headers: { authorization: helpers.create_auth({ role: "user", user: "thewhite@valinor.com" }) },
		});
		this.sandbox.assert.calledOnce(permissionDenied);
		done();
	});

	it('should not be able to edit user if not manager', async () => {
		let model = mocks.Users.getRandom();
		model.role = "user";
		let user = await this.controller.createUser({ 
			body: model,
			headers: { authorization: helpers.create_auth({ role: "admin" }) },
		}, null);
		let permissionDenied = this.sandbox.stub(this.controller, "permissionDenied");
		this.controller.updateUser({
			params: { id: user._id },
			headers: { authorization: helpers.create_auth({ role: "user" }) },
		});
		this.sandbox.assert.calledOnce(permissionDenied);
	});

	it('should be able to edit anyone as a manager', (done) => {
		let model = mocks.Users.getRandom();
		model.name = "Passolargo";
		model.email = "aragorn@middleearth.net";
		model.role = "user";
		let user = this.controller.createUser({ 
			body: model,
			headers: { authorization: helpers.create_auth({ role: "admin" }) },
		}, null)
			.then(user => {
				this.onSuccess.callsFake((res, data) => {
					expect(data.name).to.be.equal("Aragorn");
					expect(data.email).to.be.equal(model.email);
					done();
				});
				this.controller.updateUser({
					params: { id: user._id },
					headers: { authorization: helpers.create_auth({ role: "manager", user: "teste@malte.com" }) },
					body: { name: "Aragorn" },
				});
			});
	});

	it('should be able to edit myself', (done) => {
		let model = mocks.Users.getRandom();
		model.name = "Gandalf the gray";
		model.email = "thegray@valinor.com";
		model.role = "user";
		let user = this.controller.createUser({ 
			body: model,
			headers: { authorization: helpers.create_auth({ role: "admin" }) },
		}, null)
			.then(user => {
				this.onSuccess.callsFake((res, data) => {
					expect(data.name).to.be.equal("Gandalf the white");
					expect(data.email).to.be.equal("thewhite@valinor.com");
					done();
				});
				this.controller.updateUser({
					params: { id: user._id },
					headers: { authorization: helpers.create_auth({ user_id: user._id, role: "user", user: "thewhite@valinor.com" }) },
					body: { name: "Gandalf the white", email: "thewhite@valinor.com" },
				});
			});
	});

	it('should change password if admin', async () => {
		let model = mocks.Users.getRandom();
		let oldPassword = model.password;
		let user = await this.controller.createUser({ 
			body: model,
			headers: { authorization: helpers.create_auth({ role: "admin" }) },
		}, null);
		let id = user.id;

		let valid = await user.checkPassword(oldPassword);
		expect(valid).to.be.true;

		this.onSuccess.callsFake((res, data) => {
			expect(data).to.be.true;
		});
		let newPassword = "ormeni";
		await this.controller.changePassword({
			params: { id: user._id },
			body: { password: newPassword },
			headers: { authorization: helpers.create_auth({ role: "admin" }) },
		});

		user = await Model.findById(id).select("password");
		valid = await user.checkPassword(oldPassword);
		expect(valid).to.be.false;
		valid = await user.checkPassword(newPassword);
		expect(valid).to.be.true;
	});

	it('should change password if user himself', async () => {
		let model = mocks.Users.getRandom();
		let oldPassword = model.password;
		let user = await this.controller.createUser({ 
			body: model,
			headers: { authorization: helpers.create_auth({ role: "admin" }) },
		}, null);

		this.onSuccess.callsFake((res, data) => {
			expect(data).to.be.true;
		});
		let newPassword = "ormeni";
		await this.controller.changePassword({
			params: { id: user._id },
			body: { password: newPassword },
			headers: { authorization: helpers.create_auth({ role: "user", user_id: user._id }) },
		});
	});

	it('should not change password if not manager or admin', async () => {
		let model = mocks.Users.getRandom();
		let oldPassword = model.password;
		let user = await this.controller.createUser({ 
			body: model,
			headers: { authorization: helpers.create_auth({ role: "admin" }) },
		}, null);

		let permissionDenied = this.sandbox.stub(this.controller, "permissionDenied");
		let newPassword = "ormeni";
		await this.controller.changePassword({
			params: { id: user._id },
			body: { password: newPassword },
			headers: { authorization: helpers.create_auth({ role: "user" }) },
		});
		this.sandbox.assert.calledOnce(permissionDenied);
	});
});
