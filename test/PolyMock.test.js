var PolyMock = require('../lib/PolyMock.js');
var assert = require('assert');
var $u = require('util');

describe('Mock', function () {

	it('creates functions and record their invocations and arguments used', function () {

		var mock = new PolyMock();

		mock.createMethod('foo');
		mock.createMethod('bar');

		assert.ok($u.isArray(mock.invocations));

		assert.strictEqual(mock.invocations.length, 0);

		assert.strictEqual(typeof(mock.object.foo), 'function');
		assert.strictEqual(typeof(mock.object.bar), 'function');

		assert.ok('foo' in mock.metadata, 'expected to find foo in metadata: ' + $u.inspect(mock.metadata));
		assert.ok('bar' in mock.metadata, 'expected to find bar in metadata: ' + $u.inspect(mock.metadata));

		assert.ok($u.isArray(mock.metadata.foo.invocations), 'expected mock.metadata.foo.invocations to be an array');
		assert.ok($u.isArray(mock.metadata.bar.invocations), 'expected mock.metadata.bar.invocations to be an array');

		assert.strictEqual(mock.metadata.foo.invocations.length, 0, 'expected mock.metadata.foo.invocations to be an empty array');
		assert.strictEqual(mock.metadata.bar.invocations.length, 0, 'expected mock.metadata.bar.invocations to be an empty array');

		mock.object.foo(1, 2);

		assert.ok(mock.metadata.foo.invocations.length, 1, 'expected to find 1 invocation in mock.metadata.foo.invocations');

		assert.ok(mock.metadata.foo.invocations[0].length, 2);

		assert.strictEqual(mock.metadata.foo.invocations[0].indexOf(1), 0, 'expected to find \'1\' at position 0 in mock.metadata.foo.invocations');
		assert.strictEqual(mock.metadata.foo.invocations[0].indexOf(2), 1, 'expected to find \'2\' at position 1 in mock.metadata.foo.invocations');

		mock.object.foo(2, 3);
		mock.object.bar(123);

		assert.strictEqual(mock.invocations.length, 3);

		assert.strictEqual(mock.invocations[0], 'foo');
		assert.strictEqual(mock.invocations[1], 'foo');
		assert.strictEqual(mock.invocations[2], 'bar');
	});

	it('fires the callback of the "real" method with predefined arguments', function (done) {

		var mock = new PolyMock();

		mock.createMethod('foo');
		mock.createMethod('bar', { callbackArgs: [1, 2] });

		function callback(a, b) {
			assert.strictEqual(a, 1);
			assert.strictEqual(b, 2);
			assert.strictEqual(mock.invocations.length, 2);
			done();
		}

		mock.object.foo(2);
		mock.object.bar(2, callback);
	});

	it('creates properties and record their assignments and invocations', function () {

		var mock = new PolyMock();

		mock.createProperty('foo');

		mock.object.foo = 1;
		mock.object.foo = 2;

		console.log(mock.object.foo);

		assert.strictEqual(mock.invocations.length, 3);
		assert.strictEqual(mock.invocations[0], 'set_foo');
		assert.strictEqual(mock.invocations[1], 'set_foo');
		assert.strictEqual(mock.invocations[2], 'get_foo');

		assert.strictEqual(mock.metadata.foo.assignments.length, 2);
		assert.strictEqual(mock.metadata.foo.assignments[0], 1);
		assert.strictEqual(mock.metadata.foo.assignments[1], 2);
	});

	it('uses a prototype given for the mock object', function () {

		function SomeClass(a) {
			this.a = a;
		}

		SomeClass.prototype.foo = function () { return 5; };

		var mock = new PolyMock(SomeClass, [ 2 ]);

		assert.ok(mock.object instanceof SomeClass);
	});

	describe('factory method', function () {

		it('creates a mock using arrays', function () {

			var mock = PolyMock.create(['foo'], ['boo']);

			assert.ok('foo' in mock.metadata);
			assert.ok('boo' in mock.metadata);
		});

		it ('creates a mock using objects', function () {

			var methods = {
				'foo': {
					options: {
						callbackArgs: [1,2,3]
					}
				}
			};

			var properties = {
				'moo': {}
			};

			var mock = PolyMock.create(methods, properties);

			assert.ok('foo' in mock.metadata);
			assert.strictEqual(mock.metadata.foo.callbackArgs.length, 3);

			assert.ok('moo' in mock.metadata);
		});
	});
});