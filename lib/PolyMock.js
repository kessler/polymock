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

var EMPTY = {};

PolyMock.prototype.createProperty = function(name, options) {

	var self = this;

	options = options || EMPTY;

	var metadata = this.metadata[name] = {
		myValue: options.initialValue || options.value
	};

	function get() {
		self.invocations.push({ property: name, operation: 'get' });
		return metadata.myValue;
	}

	function set(value) {
		self.invocations.push({ property: name, operation: 'set', value: value });
		metadata.myValue = value;
	}

	if (typeof(options.get) === 'function') {
		metadata.get = options.get;
	} else {
		metadata.get = get;
	}

	if (typeof(options.set) === 'function') {
		metadata.set = options.set;
	} else {
		metadata.set = set;
	}

	if (typeof(options.enumerable) === 'boolean') {
		metadata.enumerable = options.enumerable;
	} else {
		metadata.enumerable = true;
	}

	if (typeof(options.configurable) !== 'boolean') {
		metadata.configurable = true;
	} else {
		metadata.configurable = true;
	}

	Object.defineProperty(this.object, name, metadata);
};

/*
	@param method - the name of the method to create

	@param options -
*/
PolyMock.prototype.createMethod = function(method, options) {

	var self = this;

	options = options || EMPTY;

	this.metadata[method] = {
		returnValue: options.returnValue,
		invokeCallback: options.invokeCallback || true,
		callbackArgs: options.callbackArgs
	};

	this.object[method] = function () {
		var args = Array.prototype.slice.call(arguments, 0);

		self.invocations.push({ method: method, arguments: args });

		var maybeCb = args[args.length - 1];

		if (self.metadata[method].invokeCallback && typeof(maybeCb) === 'function') {
			maybeCb.apply(null, self.metadata[method].callbackArgs || []);
		}

		return self.metadata[method].returnValue;
	};
};

PolyMock.create = function(methods, properties, Fn, args) {
	var mock = new PolyMock(Fn, args);

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
			mock.createProperty(property, properties[property].options);
		}

	}

	return mock;
};