'use strict';

var $u = require('util');

/*
	metadata
	invocations
	createProperty
	createMethod

*/
function PolyMock(Fn, args) {

	this.metadata = {};

	this.invocations = [];

	if (Fn) {
		this.object = new Fn(args);
	} else {
		this.object = {};
	}
}

module.exports = PolyMock;

PolyMock.prototype.createProperty = function(name, descriptor) {

	var self = this;

	function get() {
		var assignments = self.metadata[name].assignments;
		self.invocations.push('get_' + name);
		return assignments[assignments.length - 1];
	}

	function set(value) {
		var assignments = self.metadata[name].assignments;
		assignments.push(value);
		self.invocations.push('set_' + name);
	}

	descriptor = descriptor || { get: get, set: set, enumerable: true, configurable: true };

	this.metadata[name] = {
		descriptor: descriptor,
		assignments: []
	};

	Object.defineProperty(this.object, name, descriptor);
};

var EMPTY = {};

/*
	@param method - the name of the method to create

	@param options -
*/
PolyMock.prototype.createMethod = function(method, options) {

	var self = this;

	options = options || EMPTY;

	this.metadata[method] = {
		invocations: [],
		returnValue: options.returnValue,
		invokeCallback: options.invokeCallback || true,
		callbackArgs: options.callbackArgs
	};

	this.object[method] = function () {
		var args = Array.prototype.slice.call(arguments, 0);

		self.invocations.push(method);
		self.metadata[method].invocations.push(args);

		var maybeCb = args[args.length - 1];

		if (self.metadata[method].invokeCallback && typeof(maybeCb) === 'function') {
			maybeCb.apply(null, self.metadata[method].callbackArgs || []);
		}

		return self.metadata[method].returnValue;
	};
};

PolyMock.create = function(methods, properties) {
	var mock = new PolyMock();

	if ($u.isArray(methods)) {

		for (var i = 0; i < methods.length; i++) {
			mock.createMethod(methods[i]);
		}

	} else if (typeof(methods) === 'object') {

		for (var method in methods) {
			mock.createMethod(method, methods[method].options);
		}

	}

	if ($u.isArray(properties)) {

		for (var j = 0; j < properties.length; j++) {
			mock.createProperty(properties[j]);
		}

	} else if (typeof(properties) === 'object') {

		for (var property in properties) {
			mock.createProperty(property, properties[property].descriptor);
		}

	}

	return mock;
};