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

mock.createMethod('foo', { returnValue: 1, invokeCallback: true, callbackArgs: [ 2 ]});

mock.createProperty('bar', { initialValue: 5 });

// x === 1
var x = mock.object.foo('x', function myCallback(val) {
	//val === 2
});

// mock.invocations[0].method === 'foo';
// mock.invocations[0].arguments === ['x', myCallback];

console.log(mock.object.bar); // prints 5

// mock.invocations[1].property === 'bar';
// mock.invocations[1].operation === 'get';

mock.object.bar = 2;

// mock.invocations[2].property === 'bar';
// mock.invocations[2].operation === 'set';
// mock.invocations[2].value === 2;

```

## Documentation
### PolyMock.ctor(Fn, args)
constructs a polymock

***Fn*** 		- use this prototype for the mock object instead of a javascript object ({})

***args***		- if the above prototype needs arguments in its "new" clause this is how to supply them

### PolyMock.prototype.createMethod = function(method, options)
***method*** 	- name of the method to create

***options*** 	-


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
22.12.2013 	- initial release

## License
Copyright (c) 2013 Yaniv Kessler. Licensed under the MIT license.
