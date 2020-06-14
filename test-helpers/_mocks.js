"use strict";

var Chance = require('chance');

module.exports = {
	Chance: new Chance(),
	Beers: require('./beers'),
	Breweries: require('./breweries'),
};


