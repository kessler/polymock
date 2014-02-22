# polymock [![Build Status](https://secure.travis-ci.org/kessler/polymock.png?branch=master)](http://travis-ci.org/kessler/polymock)

mock objects generator

## Install
```
npm install polymock
```
## Example
```javascript
var PolyMock = require('polymock');

var mock = PolyMock.create();

mock.createMethod('foo', 1, { callbackArgs: [ 2 ] });

mock.createProperty('bar', 5);

// x === 1
var x = mock.object.foo('x', function myCallback(val) {
	//val === 2
});
// mock.invocations[0].method === 'foo';
// mock.invocations[0].arguments === ['x', myCallback];


console.log(mock.object.bar); // prints 5
// mock.invocations[1].property === 'bar';
// mock.invocations[1].operation === 'get';
// mock.invocations[1].value === 5;


mock.object.bar = 2;
// mock.invocations[2].property === 'bar';
// mock.invocations[2].operation === 'set';
// mock.invocations[2].value === 2;

```

## Documentation
### PolyMock.ctor(Fn, args)
constructs a polymock

***Fn*** - use this prototype for the mock object instead of a javascript object ({})

***args*** - if the above prototype needs arguments in its "new" clause this is how to supply them

### PolyMock.prototype.createMethod = function(method, returnValue, options)
***method*** - name of the method to create

***returnValue*** - anything is permitted here.
```
	// will return 5 will mock.object.foo() is invoked
	mock.createMethod('foo', 5);

	// will return the result of invoking the dynamicValue function with scope mock.object
	mock.createMethod('foo', 'dontcare', { dynamicValue: function(a) { return 2 * a; } });
```
When dynamic value is provided in the options the return value is ignored

***options***
```
	{
		invokeCallback: true, // automatically invoke the last argument if its a function, defaults to true
		callbackArgs: [1, 2] // arguments to use in callback
	}
```
### PolyMock.prototype.createProperty = function(name, initialValue, options)
***name*** - name of the property

***options***
```
	{
		initialValue: 9
	}
```
can also override enumerable and configurable options of Object.defineProperty (but not get/set) using these options
###PolyMock.create(Fn, args)
***Fn*** - see Ctor()

***Args*** - see Ctor()

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
22.12.2013 	- initial release

## License
Copyright (c) 2013 Yaniv Kessler. Licensed under the MIT license.

