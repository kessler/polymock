'use strict';

var EventEmitter = require('events').EventEmitter;

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

PolyMock.prototype.createProperty = function(name, initialValue, options) {

	var self = this;

	options = options || EMPTY;

	var metadata = this.metadata[name] = {
		myValue: initialValue
	};

	function get() {
		self.invocations.push({ property: name, operation: 'get', value: metadata.myValue });
		return metadata.myValue;
	}

	metadata.get = get;

	function set(value) {
		self.invocations.push({ property: name, operation: 'set', value: value });
		metadata.myValue = value;
	}

	metadata.set = set;

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
PolyMock.prototype.createMethod = function(method, returnValue, options) {

	var self = this;

	options = options || EMPTY;

	var metadata = this.metadata[method] = {
		returnValue: options.dynamicValue || returnValue,
		dynamicValue: options.dynamicValue ? true : false,
		invokeCallback: typeof(options.invokeCallback) === 'boolean' ? options.invokeCallback : true,
		callbackArgs: options.callbackArgs
	};

	this.object[method] = function () {

		var args = Array.prototype.slice.call(arguments, 0);

		self.invocations.push({ method: method, arguments: args });

		var maybeCb = args[args.length - 1];

		if (metadata.invokeCallback && typeof(maybeCb) === 'function') {
			maybeCb.apply(null, metadata.callbackArgs || []);
		}

		if (metadata.dynamicValue) {
			return metadata.returnValue.apply(self.object, args);
		} else {
			return metadata.returnValue;
		}
	};
};

PolyMock.prototype.createEventEmitter = function() {

	var emitter = this.emitter = new EventEmitter();

	var onMethodOptions = {
		invokeCallback: false,
		dynamicValue: function(event, listener) {
			emitter.on(event, listener);
		}
	};

	this.createMethod('on', undefined, onMethodOptions);

	var onceMethodOptions = {
		invokeCallback: false,
		dynamicValue: function(event, listener) {
			emitter.once(event, listener);
		}
	};

	this.createMethod('once', undefined, onceMethodOptions);

	var emitMethodOptions = {
		invokeCallback: false,
		dynamicValue: function() {
			emitter.emit.apply(emitter, arguments);
		}
	};

	this.createMethod('emit', undefined, emitMethodOptions);
};


PolyMock.create = function(opts) {
	opts = opts || {};
	var mock = new PolyMock(opts.Fn, opts.args);
	return mock;
};