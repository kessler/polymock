var PolyMock = require('../lib/PolyMock.js');
var EventEmitter = require('events').EventEmitter;
var assert = require('assert');
var $u = require('util');

describe('Mock', function () {

	it('creates methods', function () {

		var mock = new PolyMock();

		mock.createMethod('foo');
		mock.createMethod('bar');

		assert.ok($u.isArray(mock.invocations));

		assert.strictEqual(mock.invocations.length, 0);

		assert.strictEqual(typeof(mock.object.foo), 'function');
		assert.strictEqual(typeof(mock.object.bar), 'function');

		assert.ok('foo' in mock.metadata, 'expected to find foo in metadata: ' + $u.inspect(mock.metadata));
		assert.ok('bar' in mock.metadata, 'expected to find bar in metadata: ' + $u.inspect(mock.metadata));

	});

	it('can have dynamic return values for mock methods', function () {
		var mock = new PolyMock();

		mock.createMethod('foo', undefined, { dynamicValue: function (a) { return a * 2; } });

		var result = mock.object.foo(2);

		assert.strictEqual(result, 4);
	});

	it('records method invocations and arguments', function () {

		var mock = new PolyMock();

		mock.createMethod('foo');
		mock.createMethod('bar');

		mock.object.foo(1, 2);

		assert.ok(mock.invocations.length, 1, 'expected to find 1 invocation in mock.metadata.foo.invocations');

		assert.strictEqual(mock.invocations[0].method, 'foo');
		assert.strictEqual(mock.invocations[0].arguments[0], 1);
		assert.strictEqual(mock.invocations[0].arguments[1], 2);

		mock.object.foo(2, 3);
		mock.object.bar(123);

		assert.strictEqual(mock.invocations.length, 3);

		assert.strictEqual(mock.invocations[0].method, 'foo');
		assert.strictEqual(mock.invocations[1].method, 'foo');
		assert.strictEqual(mock.invocations[2].method, 'bar');
	});

	it('fires the callback of the "real" method with predefined arguments', function (done) {

		var mock = new PolyMock();

		mock.createMethod('foo');
		mock.createMethod('bar', undefined, { callbackArgs: [1, 2] });

		function callback(a, b) {
			assert.strictEqual(a, 1);
			assert.strictEqual(b, 2);
			assert.strictEqual(mock.invocations.length, 2);
			done();
		}

		mock.object.foo(2);
		mock.object.bar(2, callback);
	});

	it('does not fires the callback of the "real" method when invokeCallback is set to false', function () {

		var mock = new PolyMock();

		mock.createMethod('bar', undefined, { invokeCallback: false });

		var cbFired = false;
		function callback() {
			cbFired = true;
		}

		mock.object.bar(2, callback);

		assert.strictEqual(cbFired, false, 'callback should not have fired');
	});

	it('creates properties', function () {

		var mock = new PolyMock();

		mock.createProperty('foo', 5);

		assert.ok('foo' in mock.metadata);
		assert.strictEqual(mock.metadata.foo.myValue, 5);
		assert.strictEqual(mock.object.foo, 5);
	});

	it('records property operations', function () {
		var mock = new PolyMock();

		mock.createProperty('foo', 5);

		console.log(mock.object.foo);

		assert.strictEqual(mock.invocations.length, 1);
		assert.strictEqual(mock.invocations[0].property, 'foo');
		assert.strictEqual(mock.invocations[0].operation, 'get'); //get from assert

		mock.object.foo = 1;
		assert.strictEqual(mock.invocations.length, 2);
		assert.strictEqual(mock.invocations[1].property, 'foo');
		assert.strictEqual(mock.invocations[1].operation, 'set');
		assert.strictEqual(mock.invocations[1].value, 1);

		mock.object.foo = 2;
		assert.strictEqual(mock.invocations.length, 3);
		assert.strictEqual(mock.invocations[2].property, 'foo');
		assert.strictEqual(mock.invocations[2].operation, 'set');
		assert.strictEqual(mock.invocations[2].value, 2);

		assert.strictEqual(mock.object.foo, 2);
	});

	it('uses a prototype for the mock object', function () {

		function SomeClass(a) {
			this.a = a;
		}

		SomeClass.prototype.foo = function () { return 5; };

		var mock = new PolyMock(SomeClass, [ 2 ]);

		assert.ok(mock.object instanceof SomeClass);
	});

	it('adds EventEmitter behavior', function () {
		var mock = new PolyMock();

		assert.strictEqual(mock.emitter, undefined);

		mock.createEventEmitter();

		assert.ok(mock.emitter instanceof EventEmitter);
		assert.ok('on' in mock.metadata);
		assert.ok('emit' in mock.metadata);
	});

	it('proxies emitter on() method from the mock to the really emitter and vice versa', function (done) {

		var mock = new PolyMock();

		mock.createEventEmitter();

		mock.object.on('event', done);

		mock.emitter.emit('event');
	});

	it('proxies emitter emit() method from the mock to the really emitter and vice versa', function (done) {

		var mock = new PolyMock();

		mock.createEventEmitter();

		mock.emitter.on('event', done);

		mock.object.emit('event');
	});



	describe('factory method', function () {
	});
});