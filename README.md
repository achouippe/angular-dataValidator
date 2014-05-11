# angular-dataValidator v0.0.2

> A controller-side validator for AngularJS.


AngularJS provides powerful form validation features through a set of dedicated directives. This validation mechanisms are well described [here](http://www.ng-newsletter.com/posts/validations.html) and [here](http://scotch.io/tutorials/javascript/angularjs-form-validation).


Built-in directives apply validation constraints on each user interaction, and add errors state details to scopes. This approach is extremely powerful to implement highly interactive forms, with a large variety of UX patterns. But it also has  drawbacks :
- It puts a lot of code in views, that mixes different concerns at the same place: presentation, business validation rules, error messages, user interactions ...
- It introduces a complexity overhead on forms that do not require rich error handling,
- Custom validation constraints requires to write new directives: these custom directives generally contain a lot of technical/structural code for only few lines of business code.

**angular-dataValidator** provides an alternative way to validate forms, based on controller-side validation rules. It is definitely less powerful than built-in AngularJS directives, but for forms with simple interactivity, it allows to write simpler code with a cleaner separation of concerns.


### TODO

**angular-dataValidator** is under development and still requires a lot of work :

- A comprehensive documentation,
- `Validator.register(constraintName, constraintFunction)` to register custom constraints,
- Global error handling configuration,
- Error messages localization support,
- Options on validate & check functions : `flatten`, `stopOnError`,
- Packaging as a bower component.

## One minute example

In an AngularJS view, we declare a login form with login, password input fields and a submit button:

```html
<form>
  <h1>Please login</h1>
  <input placeholder="Login (email address)" ng-model="login" type="text"/>
  <input placeholder="Password" ng-model="password" type="password"/>
  <button ng-click="submit()">Submit</button>
</form>
```

In the controller, we declare the form validation constraints :

```javascript
var validationRules = Validator({
  'login': [
    Validator('Login is required').required(),
    Validator('Login must be a valid email address').email()
  ],
  'password': Validator('Password is required').required()
});

```

Then, we add a submit function on the scope that is called when user clicks on the submit button :

```javascript
$scope.submit = function () {
  delete $scope.errors;
  delete $scope.message;

  var errors = validationRules.check($scope);
  if (errors !== undefined) {
    $scope.errors = errors;
  } else {
    $scope.message = 'Login Success !';
  }
};
```

It validates user inputs, and adds an error object or a confirmation message to the scope, depending on the validation result.

Finally, we display confirmation and error messages in the view :
```html
<div ng-show="message">{{message}}</div>

<form>
  <h1>Please login</h1>

  <input placeholder="Login (email address)" ng-model="login" type="text"/>
  <div ng-show="errors.login">{{errors.login.message}}</div>

  <input placeholder="Password" ng-model="password" type="password"/>
  <div ng-show="errors.password">{{errors.password.message}}</div>

  <button ng-click="submit()">Submit</button>
</form>
```



## Getting started

### Installation

Get the latest zip distribution file from [/downloads](https://github.com/achouippe/angular-dataValidator/tree/master/downloads) directory, install it and add `<script src="path/to/validator-min.js"></script>` in your AngularJS application. Then, define a dependency to the **dataValidator** module in your AngularJS application:
```javascript
angular.module('myApp', ['dataValidator' /*, 'ngRoute', ... */]);
```
**dataValidator** module provides the **Validator** service, just get it by using AngularJS dependency injection :
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

The `check` function takes a value as input and applies validation constraints on it. It returns `undefined` if all the constraints pass, or an error object if a constraint does not pass :

```javascript
var error = rule.check('foobar');
if (error === undefined) {
  console.log('Success !');
} else {
  console.log('Error: ' + error.message);
}
```

#### rule.validate:

The `validate` function validates input value and uses the promise AngularJS API to handle success and error cases :

```javascript
rule.validate('foobar').then(function () {
  console.log('Success !');
}, function (error) {
  console.log('Error: ' + error.message);
});

```

### Objects validation
**Validator** service can also construct rules that validate JavaScript objects. The rules are constructed by passing an object to the **Validator** service:

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

The constraint descriptor passed to `Validator(...)` is a flat key-value object. The keys are `$parse` expressions, and values are sets of constraint declarations applied on the result of the `$parse` evaluation.

Here is an example with a nested input object :


```javascript
var signup = {
  userDetail: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@doe.com'
  }
  account: {
    username: 'johndoe'
    password: 'Foob@r123'
  }
}

var validationRules = Validator({
  'userDetail.firstName': Validator('First name is required').required(),
  'userDetail.lastName': Validator('Last name is required').required(),
  'userDetail.email': [
    Validator('Email address is required').required(),
    Validator('Please enter a valid email address').email()
  ],
  'account.username': [
    Validator('Username is required').required(),
    Validator('Username must only contain alphanumerical characters').alphanum()
  ],
  'account.password': [
    Validator('Password is required').required(),
    Validator('A minimum password length of 8 characters is required').minLength(8),
    Validator('Password must contain at least a lowercase character, an uppercase character and a numerical character').match(/[a-z]+/).match(/[A-Z]+/).match(/[0-9]+/)
  ]
});

validationRules.validate($scope).then(function ok() {
  $scope.message = 'Success !';
}, function ko(errors) {
  $scope.errors = errors;
});

```

### The `error` object
TODO

### Add custom validation constraints
TODO

### Play with functions
TODO

### Play with `$parse`
TODO

## Development how to

### Workspace configuration

- Install [NodeJs](http://nodejs.org/), [Grunt](http://gruntjs.com/) and [Bower](http://bower.io/),
- Clone the github repository, and run the following command lines to donwload NodeJS and Bower dependencies:
```
npm install
bower install
```

Grunt tasks are :
- `grunt test`: Apply jshint checks and karma unit tests,
- `grunt clean`: removes all the build file,
- `grunt build`: build a dist version in [/downloads](https://github.com/achouippe/angular-dataValidator/tree/master/downloads) directory,
- `grunt sampleapp`: Launch a sample application on port 9000.
