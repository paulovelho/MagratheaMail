"use strict";
var Chance = require('chance');
var chance = new Chance();

var request = require('supertest');
var server = require('../index').server;

exports.getRandom = () => {
	let name = chance.last() + "brew";
	return {
		malte_id: chance.natural(),
		ca_id: chance.hash(),
		name: name,
		company_name: name + " COMERCIO DE BEBIDAS",
		email: chance.email(),
		active: true,
		origin: chance.city()
	};
};
