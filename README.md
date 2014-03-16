# angular-dataValidator v0.0.1

> Controller-side validator for AngularJS.

## Getting started

### Installation

Get the latest zip distribution file from [/downloads](https://github.com/achouippe/angular-dataValidator/tree/master/downloads) directory, install it and add `<script src="path/to/validator-min.js"></script>` in your AngularJS application. Then, define a dependency to the **dataValidator** module in your AngularJS application:
```javascript
angular.module('myApp', ['dataValidator' /*, 'ngRoute', ... */]);
```
**dataValidator** module provides the **Validator** service, just get it by using AngularJS injection :
```javascript
angular.module('myApp').controller('myCtrl', function ($scope, Validator) {
  /* ... */
};
```

### Simple fields validation

First we create a rule object : 
```javascript
var rule = validator('The field is required, and its min length is 10.').required().minLength(10);
```
A rule object is composed of an error message passed to the **Validator** service, and a list of constraints that are defined by chaining function calls.

Once the *rule* object is created, it provides two functions to apply validation constraints: 

#### rule.check:
```javascript
var error = rule.check('foobar');
if (error === undefined) {
  console.log('Success !');
} else {
  console.log('Error: ' + error.message);
}
```

#### rule.validate:
```javascript
rule.validate('foobar').then(function () {
  console.log('Success !');
}, function (error) {
  console.log('Error: ' + error.message);
});

```

### Full objects validation
**Validator** can construct rules that validate JavaScript objects. The rules are constructed by passing an object to the **Validator** service:

```javascript

// Construct the validation rules
var rules = Validator({
  'login': [
    Validator('Login is required').required(),
    Validator('Login must be a valid email address').email()
  ],
  'password': Validator('Password is required').required()
});

// Object to validate
var credentials = {
  login: 'foo@bar.com',
  password: 'foobar-password'
};

// Apply rules on input object
rules.validate(credentials).then(function () {
  console.log('Success !');
}, function (errors) {
  angular.forEach(errors, function(error){
    console.log('Error: ' + error.message);
  });
});

```


## TODO
- Push a downloadable zip file in /downloads
- Full source documentation,
- Add `Validator.register(...)` to register custom constraints,
- Add `isError(object)` on Validator,
- Add a global error handling configuration feature,
- Add options to validate & check functions : `flatten`, `stopOnError`,
- Package as a bower component.

## Development how to

### Workspace configuration

- Install [NodeJs](http://nodejs.org/), [Grunt](http://gruntjs.com/) and [Bower](http://bower.io/),
- Run the following comand lines to donwload NodeJS and Bower components:
```
npm install
bower install
```

Grunt tasks are :
- `grunt test`: Apply jshint checks and karma unit tests,
- `grunt clean`: removes all the build file,
- `grunt build`: build a dist version in [/downloads](https://github.com/achouippe/angular-dataValidator/tree/master/downloads) directory,
- `grunt sampleapp`: Launch a sample application on port 9000.


