"use strict";
var log = require("color-logs")(true, true, __filename);
var expect = require('chai').expect;
var sinon = require('sinon');

var mocks = require('../../test-helpers/_mocks');
var helpers = require('../../test-helpers/_helpers');


describe('Auth controller', () => {
	var controller;
	var sandbox;
	var onSuccess;

	before(done => helpers.db_open(done));
	after(done => helpers.db_close(done));

	beforeEach(() => {
		this.sandbox = sinon.createSandbox();
		this.controller = require('./controller');
		this.onSuccess = this.sandbox.stub(this.controller, "success");
	});
	afterEach(() => this.sandbox.restore());

	it('should return user on authentication', async () => {
		var UserController = require('../users/controller');

		let model = mocks.Users.getRandom();
		this.onSuccess.callsFake((res, data) => {
				expect(data.name).to.be.equal(model.name);
				expect(data._id).to.not.be.null;
				done();
		});
		await UserController.createUser({
			body: model,
			headers: { authorization: helpers.create_auth({ role: "manager" }) },
		}, null);

		this.onSuccess.callsFake((res, data) => {
			expect(data.token).to.not.be.null;
			expect(data.user).to.not.be.null;
			expect(data.user.name).to.be.equal(model.name);
			expect(data.user.role).to.be.equal(model.role);
			expect(data.user.password).to.be.null;
		});
		await this.controller.access({
			body: {
				email: model.email,
				password: model.password
			}
		}, null);
	});
});
