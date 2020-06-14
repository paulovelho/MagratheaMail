"use strict";
var Chance = require('chance');
var chance = new Chance();

var request = require('supertest');
var server = require('../index').server;

exports.getRandom = () => {
	let name = chance.last() + " IPA";
	let price = chance.natural({ min: 700, max: 2000 });
	let profit = price * 15 / 100;
	return {
		malte_id: chance.natural(),
		ca_id: chance.hash(),
		name: name,
		code: 'B' + chance.natural({ min: 1000, max: 9999 }),
		active: true,
		cost: price,
		value: price + profit
	};
};
