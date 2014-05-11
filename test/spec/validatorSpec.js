'use strict';

describe(' dataValidator /', function () {

  var Validator;

  var $rootScope;

  beforeEach(function () {
    module('dataValidator');
    inject(function($injector) {
      Validator = $injector.get('Validator');
      $rootScope = $injector.get('$rootScope');
    });
  });

  afterEach(inject(function ($rootScope) {
    $rootScope.$digest();
  }));


  // Checks that the promise is in success
  function expectSuccess (validationPromise) {
    validationPromise.then(function () {
      // Nothing here
    }, function (error) {
      throw ('Validation should success here, error message: ' + error.message);
    });
  };

  // Checks that the promise is in error
  function expectFail (validationPromise, errorCallback) {
    validationPromise.then(function () {
      throw 'Validation should fail here.';
    }, errorCallback);
  };

  // Test Validator injection
  it('Validator should be defined', function () {
    expect(Validator).toBeDefined();
  });

  describe('Simple fields validation /', function() {

    it('should always success for empty rules', function() {
      var empty = Validator();
      expectSuccess(empty.validate('foo bar'));
      expectSuccess(empty.validate(undefined));
    });

    it('should accept validator construction without error messages', function() {
      var empty = Validator().required();
      expectSuccess(empty.validate('foo bar'));
      expectFail(empty.validate(undefined), function(error) {
        expect(error.value).not.toBeDefined();
        expect(error.message).not.toBeDefined();
        expect(error.constraint).toEqual('required');
        expect(error.args).not.toBeDefined();
      });
    });

    it('should apply all the registered constraints until one fails', function () {
      var rule = Validator('Multiple constraint rule').required().min(4).max(10);
      expectSuccess(rule.validate(5));

      expectFail(rule.validate(undefined));
      expectFail(rule.validate(1));
      expectFail(rule.validate(15));
    });

    it('should provide a full error object', function () {
      var rule = Validator('Multiple constraint rule').required().min(4).max(10);

      expectFail(rule.validate(undefined), function(error) {
        expect(error.value).not.toBeDefined();
        expect(error.message).toEqual('Multiple constraint rule');
        expect(error.constraint).toEqual('required');
        expect(error.args).not.toBeDefined();
      });

      expectFail(rule.validate(1), function(error) {
        expect(error.value).toEqual(1);
        expect(error.message).toEqual('Multiple constraint rule');
        expect(error.constraint).toEqual('min');
        expect(error.args[0]).toEqual(4);
        expect(error.args.length).toEqual(1);
      });

      expectFail(rule.validate(15), function(error) {
        expect(error.value).toEqual(15);
        expect(error.message).toEqual('Multiple constraint rule');
        expect(error.constraint).toEqual('max');
        expect(error.args[0]).toEqual(10);
        expect(error.args.length).toEqual(1);
      });
    });

    describe('Function handling /', function() {

      it('should accept error messages returned by functions', function() {
        var rule = Validator(function(value) { return value + ' is not a valid input'}).required().min(4).max(10);

        expectFail(rule.validate(undefined), function(error) {
          expect(error.message).toEqual('undefined is not a valid input');
        });

        expectFail(rule.validate(42), function(error) {
          expect(error.message).toEqual('42 is not a valid input');
        });
      });

      it('should accept function as constraint arguments', function() {
        var minBoundary = 0;
        var maxBoundary = 5;

        var rule = Validator('Function test').required().min(function() {return minBoundary}).max(function () {return maxBoundary});

        expectSuccess(rule.validate(3));

        minBoundary = 10;
        maxBoundary = 50;

        expectFail(rule.validate(4), function(error) {
          expect(error.constraint).toEqual('min');
          expect(error.args[0]).toEqual(10);
        });

        expectFail(rule.validate(100), function(error) {
          expect(error.constraint).toEqual('max');
          expect(error.args[0]).toEqual(50);
        });

      });

      it('should pass tested values to functions', function() {

        var rule = Validator('Function test').required().min(function(value) {return value * 2});

        expectFail(rule.validate(4), function(error) {
          expect(error.constraint).toEqual('min');
          expect(error.args[0]).toEqual(8);
        });

        expectFail(rule.validate(100), function(error) {
          expect(error.constraint).toEqual('min');
          expect(error.args[0]).toEqual(200);
        });

      });

    });

  });

  describe('Validator.isError /', function() {

    it('should return false for undefined or null objects', function() {
      expect(Validator.isError()).toBe(false);
      expect(Validator.isError(null)).toBe(false);
    });

    it('should return false for non error objects', function() {
      expect(Validator.isError(true)).toBe(false);
      expect(Validator.isError({})).toBe(false);
    });

    it('should return true for error object on simple fields', function() {
      var rule = Validator('Simple rule').minLength(42);

      var error = rule.check('foobar');
      expect(Validator.isError(error)).toBe(true);

    });

    it('should return true for root error object on objects', function() {
      var test = {
        foo: 'bar',
        bar: 'foo'
      };
      var rule = Validator({
        foo: Validator('Foo is required').required(),
        bar: Validator('Bar min length is 42').minLength(42)
      });

      var error = rule.check(test);
      expect(Validator.isError(error)).toBe(true);
    });

    it('should return true for leaf error object on objects', function() {
      var test = {
        foo: 'bar',
        bar: 'foo'
      };
      var rule = Validator({
        foo: Validator('Foo is required').required(),
        bar: Validator('Bar min length is 42').minLength(42)
      });

      var error = rule.check(test);
      expect(Validator.isError(error.foo)).toBe(false);
      expect(Validator.isError(error.bar)).toBe(true);
    })



  })

  describe('objects validation', function() {

    it('should check all the input rules', function() {
      var rule = Validator({
        'login': Validator('Login is required').required(),
        'password': Validator('Password is required').required()
      });

      var credentials = {
        login: 'login',
        password: 'password'
      };

      expectSuccess(rule.validate(credentials));

      delete credentials.login;

      expectFail(rule.validate(credentials), function(errors) {
          expect(errors.login).toBeDefined();
          expect(errors.login.message).toEqual('Login is required');
          expect(errors.login.constraint).toEqual('required');
      });

      delete credentials.password;

      expectFail(rule.validate(credentials), function(errors) {
          expect(errors.login).toBeDefined();
          expect(errors.login.message).toEqual('Login is required');
          expect(errors.password.constraint).toEqual('required');
          expect(errors.password).toBeDefined();
          expect(errors.password.message).toEqual('Password is required');
          expect(errors.password.constraint).toEqual('required');
      });

    });

    it('should allow complex $parse expressions', function() {
      var rule = Validator({
        'login || email': Validator('A login or email address is required').required(),
        'email': Validator(function(value) { return value + ' is not a valid email address';}).email(),
        'password': Validator('Password is required').required()
      });

      var credentials = {
        login: 'login',
        password: 'password'
      };

      expectSuccess(rule.validate(credentials));

      delete credentials.login;
      expectFail(rule.validate(credentials), function(errors) {
          expect(errors['login || email']).toBeDefined();
          expect(errors['login || email'].message).toEqual('A login or email address is required');
          expect(errors['login || email'].constraint).toEqual('required');
      });

      credentials.email = 'email';
      expectFail(rule.validate(credentials), function(errors) {
          expect(errors.email).toBeDefined();
          expect(errors.email.message).toEqual('email is not a valid email address');
          expect(errors.email.constraint).toEqual('email');
      });

      credentials.email = 'email@domain.com';
      expectSuccess(rule.validate(credentials));

    });

  });

  describe('Builtin constraint', function () {

    // required
    describe('required', function () {
      it('should success on strings', function () {
        expectSuccess(Validator('error').required().validate('foo'));
      });

      it('should success on objects', function () {
        expectSuccess(Validator('error').required().validate({foo:'bar'}));
      });

      it('should success on empty objects', function () {
        expectSuccess(Validator('error').required().validate({}));
      });

      it('should success on numerics', function () {
        expectSuccess(Validator('error').required().validate(42));
      });

      it('should success on arrays', function () {
        expectSuccess(Validator('error').required().validate([1,2,3]));
      });

      it('should success on empty arrays', function () {
        expectSuccess(Validator('error').required().validate([]));
      });

      it('should fail on undefined', function () {
        expectFail(Validator('error').required().validate(undefined));
      });

      it('should fail on null', function () {
        expectFail(Validator('error').required().validate(null));
      });

      it('should fail on empty string', function () {
        expectFail(Validator('error').required().validate(''));
      });
    });

    describe('min', function() {
      it('should success on undefined or null values', function () {
        expectSuccess(Validator('error').min(3).validate(null));
        expectSuccess(Validator('error').min(3).validate(undefined));
      });

      it('should success on 5 for min(3)', function () {
        expectSuccess(Validator('error').min(3).validate(5));
      });

      it('should success on 3 for min(3)', function () {
        expectSuccess(Validator('error').min(3).validate(3));
      });

      it('should fail on 5 for min(50)', function () {
        expectFail(Validator('error').min(50).validate(5));
      });

      it('should fail on strings or objects', function () {
        expectFail(Validator('error').min(50).validate('foo'));
        expectFail(Validator('error').min(50).validate({foo:'bar'}));
      });
    });

    describe('max', function() {
      it('should success on undefined or null values', function () {
        expectSuccess(Validator('error').max(3).validate(null));
        expectSuccess(Validator('error').max(3).validate(undefined));
      });

      it('should success on 5 for max(50)', function () {
        expectSuccess(Validator('error').max(50).validate(5));
      });

      it('should success on 50 for max(50)', function () {
        expectSuccess(Validator('error').max(50).validate(5));
      });

      it('should fail on 50 for max(5)', function () {
        expectFail(Validator('error').max(5).validate(50));
      });

      it('should fail on strings or objects', function () {
        expectFail(Validator('error').max(50).validate('foo'));
        expectFail(Validator('error').max(50).validate({foo:'bar'}));
      });
    });

    describe('positive', function() {
      it('should success on undefined or null values', function () {
        expectSuccess(Validator('error').positive().validate(null));
        expectSuccess(Validator('error').positive().validate(undefined));
      });

      it('should success on 5', function () {
        expectSuccess(Validator('error').positive().validate(5));
      });

      it('should success on 0', function () {
        expectSuccess(Validator('error').positive().validate(0));
      });

      it('should fail on -10', function () {
        expectFail(Validator('error').positive().validate(-10));
      });
    });

    describe('negative', function() {
      it('should success on undefined or null values', function () {
        expectSuccess(Validator('error').negative().validate(null));
        expectSuccess(Validator('error').negative().validate(undefined));
      });

      it('should fail on 5', function () {
        expectFail(Validator('error').negative().validate(5));
      });

      it('should success on 0', function () {
        expectSuccess(Validator('error').negative().validate(0));
      });

      it('should success on -10', function () {
        expectSuccess(Validator('error').negative().validate(-10));
      });
    });


    describe('minLength', function() {
      it('should success on undefined or null values', function () {
        expectSuccess(Validator('error').minLength(3).validate(null));
        expectSuccess(Validator('error').minLength(3).validate(undefined));
      });

      it('should success on "foo" for minLength(1)', function () {
        expectSuccess(Validator('error').minLength(1).validate('foo'));
      });

      it('should success on "foo" for minLength(3)', function () {
        expectSuccess(Validator('error').minLength(3).validate('foo'));
      });

      it('should fail on "foo" for minLength(50)', function () {
        expectFail(Validator('error').minLength(50).validate('foo'));
      });

      it('should success on [1,2,3] for minLength(1)', function () {
        expectSuccess(Validator('error').minLength(1).validate([1,2,3]));
      });

      it('should success on [1,2,3] for minLength(3)', function () {
        expectSuccess(Validator('error').minLength(3).validate([1,2,3]));
      });

      it('should fail on [1,2,3] for minLength(50)', function () {
        expectFail(Validator('error').minLength(50).validate([1,2,3]));
      });
    });

    describe('maxLength', function() {

      it('should success on undefined or null values', function () {
        expectSuccess(Validator('error').maxLength(3).validate(null));
        expectSuccess(Validator('error').maxLength(3).validate(undefined));
      });

      it('should success on "foo" for maxLength(50)', function () {
        expectSuccess(Validator('error').maxLength(50).validate('foo'));
      });

      it('should success on "foo" for maxLength(3)', function () {
        expectSuccess(Validator('error').maxLength(3).validate('foo'));
      });

      it('should fail on "foo" for maxLength(1)', function () {
        expectFail(Validator('error').maxLength(1).validate('foo'));
      });

      it('should success on [1,2,3] for maxLength(50)', function () {
        expectSuccess(Validator('error').maxLength(50).validate([1,2,3]));
      });

      it('should success on [1,2,3] for maxLength(3)', function () {
        expectSuccess(Validator('error').maxLength(3).validate([1,2,3]));
      });

      it('should fail on [1,2,3] for maxLength(1)', function () {
        expectFail(Validator('error').maxLength(1).validate([1,2,3]));
      });
    });

    describe('length', function() {

      it('should success on undefined or null values', function () {
        expectSuccess(Validator('error').length(3).validate(null));
        expectSuccess(Validator('error').length(3).validate(undefined));
      });

      it('should success on "foo" for length(3)', function () {
        expectSuccess(Validator('error').length(3).validate('foo'));
      });

      it('should fail on "foo" for length(15)', function () {
        expectFail(Validator('error').length(15).validate('foo'));
      });

      it('should success on [1,2,3] for length(3)', function () {
        expectSuccess(Validator('error').length(3).validate([1,2,3]));
      });

      it('should success on [1,2,3] for length(15)', function () {
        expectFail(Validator('error').length(15).validate([1,2,3]));
      });
    });

    describe('match', function() {
      it('should success on undefined or null values', function () {
        expectSuccess(Validator('error').match(/[0-9]*/).validate(null));
        expectSuccess(Validator('error').match(/[0-9]*/).validate(undefined));
      });

      it('should success on foobar for match(/^[a-z]*$/)', function () {
        expectSuccess(Validator('error').match(/^[a-z]*$/).validate('foobar'));
      });

      it('should fail on foobar for match(/^[0-9]*$/)', function () {
        expectFail(Validator('error').match(/^[0-9]*$/).validate('foobar'));
      });
    });

    describe('email', function() {
      it('should success on undefined or null values', function () {
        expectSuccess(Validator('error').email().validate(null));
        expectSuccess(Validator('error').email().validate(undefined));
      });

      it('should success on "foo.bar@baz.com"', function () {
        expectSuccess(Validator('error').email().validate('foo.bar@baz.com'));
      });

      it('should fail on "foo.bar@baz"', function () {
        expectFail(Validator('error').email().validate('foo.bar@baz'));
      });
    });

    describe('numeric', function() {
      it('should success on undefined or null values', function () {
        expectSuccess(Validator('error').numeric().validate(null));
        expectSuccess(Validator('error').numeric().validate(undefined));
      });

      it('should success on 1234', function () {
        expectSuccess(Validator('error').numeric().validate('1234'));
      });

      it('should fail on abcde', function () {
        expectFail(Validator('error').numeric().validate('abcde'));
      });
    });

    describe('alphanum', function() {
      it('should success on undefined or null values', function () {
        expectSuccess(Validator('error').alphanum().validate(null));
        expectSuccess(Validator('error').alphanum().validate(undefined));
      });

      it('should success on abcde', function () {
        expectSuccess(Validator('error').alphanum().validate('abcde'));
      });

      it('should success on 1234', function () {
        expectSuccess(Validator('error').alphanum().validate('1234'));
      });

      it('should success on 1234abcde', function () {
        expectSuccess(Validator('error').alphanum().validate('1234abcde'));
      });

      it('should fail on "1234 abcde"', function () {
        expectFail(Validator('error').alphanum().validate('1234 abcde'));
      });
    });

    describe('numericSpace', function() {
      it('should success on undefined or null values', function () {
        expectSuccess(Validator('error').numericSpace().validate(null));
        expectSuccess(Validator('error').numeric().validate(undefined));
      });

      it('should success on 1234', function () {
        expectSuccess(Validator('error').numericSpace().validate('1234'));
      });

      it('should success on 12 34', function () {
        expectSuccess(Validator('error').numericSpace().validate('12 34'));
      });

      it('should fail on abcde', function () {
        expectFail(Validator('error').numericSpace().validate('abcde'));
      });

      it('should fail on abc de', function () {
        expectFail(Validator('error').numericSpace().validate('abc de'));
      });
    });

    describe('alphanumSpace', function() {
      it('should success on undefined or null values', function () {
        expectSuccess(Validator('error').alphanumSpace().validate(null));
        expectSuccess(Validator('error').alphanumSpace().validate(undefined));
      });

      it('should success on abcde', function () {
        expectSuccess(Validator('error').alphanumSpace().validate('abcde'));
      });

      it('should success on 1234', function () {
        expectSuccess(Validator('error').alphanumSpace().validate('1234'));
      });

      it('should success on 1234abcde', function () {
        expectSuccess(Validator('error').alphanumSpace().validate('1234abcde'));
      });

      it('should success on "1234 abcde"', function () {
        expectSuccess(Validator('error').alphanumSpace().validate('1234 abcde'));
      });

      it('should success on "1234-abcde"', function () {
        expectFail(Validator('error').alphanumSpace().validate('1234-abcde'));
      });
    });

    describe('noSpace', function() {
      it('should success on undefined or null values', function () {
        expectSuccess(Validator('error').noSpace().validate(null));
        expectSuccess(Validator('error').noSpace().validate(undefined));
      });

      it('should success on "bar"', function () {
        expectSuccess(Validator('error').noSpace().validate('bar'));
      });

      it('should fail on "bar ")', function () {
        expectFail(Validator('error').noSpace().validate('bar '));
      });
    });

    describe('oneOf', function() {
      it('should success on undefined or null values', function () {
        expectSuccess(Validator('error').oneOf(1,2,3).validate(null));
        expectSuccess(Validator('error').oneOf(1,2,3).validate(undefined));
      });

      it('should success on "bar" for oneOf("foo", "bar")', function () {
        expectFail(Validator('error').length('foo', 'bar').validate('foo'));
      });

      it('should success on "baz" for oneOf("foo", "bar")', function () {
        expectFail(Validator('error').length('foo', 'bar').validate('baz'));
      });
    });

    describe('isTrue', function() {
      it('should success on undefined or null values', function () {
        expectSuccess(Validator('error').isTrue().validate(null));
        expectSuccess(Validator('error').isTrue().validate(undefined));
      });

      it('should only success on true if value is defined', function () {
        var rule = Validator('error').isTrue();
        expectSuccess(rule.validate(true));
        expectFail(rule.validate({}));
        expectFail(rule.validate({foo:'bar'}));
        expectFail(rule.validate([]));
        expectFail(rule.validate([1,2]));
        expectFail(rule.validate(false));
      });

    });

    describe('isFalse', function() {
      it('should success on undefined or null values', function () {
        expectSuccess(Validator('error').isFalse().validate(null));
        expectSuccess(Validator('error').isFalse().validate(undefined));
      });

      it('should only success on false if value is defined', function () {
        var rule = Validator('error').isFalse();
        expectSuccess(rule.validate(false));
        expectFail(rule.validate({}));
        expectFail(rule.validate({foo:'bar'}));
        expectFail(rule.validate([]));
        expectFail(rule.validate([1,2]));
        expectFail(rule.validate(true));
      });

    });

    describe('equals', function() {
      it('should success on undefined or null values', function () {
        expectSuccess(Validator('error').equals(42).validate(null));
        expectSuccess(Validator('error').equals(42).validate(undefined));
      });

      it('should handle numerics', function() {
        expectSuccess(Validator('error').equals(42).validate(42));
        expectSuccess(Validator('error').equals(42).validate(21 * 2));
        expectFail(Validator('error').equals(42).validate('42'));
      });

      it('should handle booleans', function() {
        expectSuccess(Validator('error').equals(true).validate(true));
        expectFail(Validator('error').equals(true).validate(false));
        expectFail(Validator('error').equals(true).validate(42));
      });

      it('should handle strings', function() {
        expectSuccess(Validator('error').equals('foo').validate('foo'));
        expectSuccess(Validator('error').equals('foo').validate('f' + 'oo'));
        expectFail(Validator('error').equals('foo').validate('bar'));
        expectFail(Validator('error').equals('foo').validate(['bar']));
      });

      it('should handle objects', function() {
        expectSuccess(Validator('error').equals({foo:'bar'}).validate({foo:'bar'}));
        expectSuccess(Validator('error').equals({foo:'bar'}).validate({foo:'b' + 'ar'}));
        expectFail(Validator('error').equals({bar:'foo'}).validate({foo:'bar'}));
      });

      it('should handle arrays', function() {
        expectSuccess(Validator('error').equals(['foo', 'bar']).validate(['foo', 'bar']));
        expectFail(Validator('error').equals(['foo', 'bar']).validate(['foo']));
      });

    });

    describe('notEqual', function() {
      it('should success on undefined or null values', function () {
        expectSuccess(Validator('error').notEqual(42).validate(null));
        expectSuccess(Validator('error').notEqual(42).validate(undefined));
      });

      it('should handle numerics', function() {
        expectFail(Validator('error').notEqual(42).validate(42));
        expectFail(Validator('error').notEqual(42).validate(21 * 2));
        expectSuccess(Validator('error').notEqual(42).validate('42'));
      });

      it('should handle booleans', function() {
        expectFail(Validator('error').notEqual(true).validate(true));
        expectSuccess(Validator('error').notEqual(true).validate(false));
        expectSuccess(Validator('error').notEqual(true).validate(42));
      });

      it('should handle strings', function() {
        expectFail(Validator('error').notEqual('foo').validate('foo'));
        expectFail(Validator('error').notEqual('foo').validate('f' + 'oo'));
        expectSuccess(Validator('error').notEqual('foo').validate('bar'));
        expectSuccess(Validator('error').notEqual('foo').validate(['bar']));
      });

      it('should handle objects', function() {
        expectFail(Validator('error').notEqual({foo:'bar'}).validate({foo:'bar'}));
        expectFail(Validator('error').notEqual({foo:'bar'}).validate({foo:'b' + 'ar'}));
        expectSuccess(Validator('error').notEqual({bar:'foo'}).validate({foo:'bar'}));
      });

      it('should handle arrays', function() {
        expectFail(Validator('error').notEqual(['foo', 'bar']).validate(['foo', 'bar']));
        expectSuccess(Validator('error').notEqual(['foo', 'bar']).validate(['foo']));
      });

    });

    describe('constraint', function() {

      it('should allow custom constraint functions', function() {
        var rule = Validator('Input must be even number').constraint(function(value) {return value %2 === 0;});

        expectSuccess(rule.validate(0));
        expectSuccess(rule.validate(42));
        expectFail(rule.validate(23));
      });

    });

  });

});
