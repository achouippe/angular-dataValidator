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


  // Checks that the promise rejects
  function expectSuccess (validationPromise) {
    validationPromise.then(function () {
      // Nothing here
    }, function (error) {
      throw ('Validation should success here, error message: ' + error.message);
    });
  };

  // Checks that the promise rejects
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
      var empty = Validator('Empty rule');
      expectSuccess(empty.validate('foo bar'));
      expectSuccess(empty.validate(undefined));
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

    it('should accept error messages returned by functions', function() {
      var rule = Validator(function(value) { return value + ' is not a valid input'}).required().min(4).max(10);

      expectFail(rule.validate(undefined), function(error) {
        expect(error.message).toEqual('undefined is not a valid input');
      });

      expectFail(rule.validate(42), function(error) {
        expect(error.message).toEqual('42 is not a valid input');
      });
    })

  });

});