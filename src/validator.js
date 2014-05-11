'use strict';

angular.module('dataValidator', []).factory('Validator', ['$q', '$parse', function ValidatorFactory($q, $parse) {

  var EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  var NUMERIC_REGEX = /^[0-9]*$/;

  var ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]*$/;

  var NUMERICSPACE_REGEX = /^[0-9\s]*$/;

  var SPACE_REGEX = /\s/;

  var ALPHANUMERICSPACE_REGEX = /^[a-zA-Z0-9\s]*$/;

  function isNotDefined(value) {
    return value === undefined || value === null;
  }

  /*
  * Contains all the registered constraints, Validator comes with built-in constraints.
  * TODO : Allow to register new constraints with Validator.register(function() {...})
  */
  var constraintFunctions = {

    /*
     * Check that the field is presnet (!= undefined, != null and != '')
    */
    required : function (value) { return !isNotDefined(value) && value !== ''; },

    /*
     * Check the field minimum value : min(42)
    */
    min : function (value, minValue) { return isNotDefined(value) || value >= minValue; },

    /*
     * Check the field maximum value : max(42)
    */
    max : function (value, maxValue) { return isNotDefined(value) || value <= maxValue; },

    /*
     * Check that field is a positive number
    */
    positive : function (value) { return isNotDefined(value) || value >= 0; },

    /*
     * Check that field is a negative number
    */
    negative : function (value) { return isNotDefined(value) || value <= 0; },

    /*
     * Check min length of the field : minLength(42)
    */
    minLength : function (value, min) { return isNotDefined(value) || value.length >= min; },

    /*
     * Check min length of the field : maxLength(42)
    */
    maxLength : function (value, max) { return isNotDefined(value) || value.length <= max; },

    /*
     * Check length of the field : length(42)
    */
    length : function (value, fixedLength) { return isNotDefined(value) || value.length === fixedLength; },

    /*
     * Check that field only contains alpha-numeric or space characters: ex: match(/[a-zAZ]+/)
    */
    match : function (value, regexp) { return isNotDefined(value) || regexp.test(value); },

    /*
     * Check that field is a valid email adress
    */
    email : function (value) { return isNotDefined(value) || EMAIL_REGEX.test(value); },

    /*
     * Check that field only contains numeric characters
    */
    numeric : function (value) { return isNotDefined(value) || NUMERIC_REGEX.test(value); },

    /*
     * Check that field only contains alpha-numeric characters
    */
    alphanum : function (value) { return isNotDefined(value) || ALPHANUMERIC_REGEX.test(value); },

    /*
     * Check that field only contains numeric or space characters
    */
    numericSpace : function (value) { return isNotDefined(value) || NUMERICSPACE_REGEX.test(value); },

    /*
     * Check that field only contains alpha-numeric or space characters
    */
    alphanumSpace : function (value) { return isNotDefined(value) || ALPHANUMERICSPACE_REGEX.test(value); },

    /*
     * Check that field does not contains space characters
    */
    noSpace : function (value) { return isNotDefined(value) || !SPACE_REGEX.test(value); },

    /*
     * Check field value is one of the input params: oneOf('toto', 'titi', 'tata')
    */
    oneOf : function () {
      var value = arguments[0];

      if (isNotDefined(value)) {
        return true;
      }

      for (var i = 1; i < arguments.length; i++) {
        if (value === arguments[i]) {
          return true;
        }
      }
      return false;
    },

    /**
     * Check that field is equal (using === operator) to an expected value: equals(expectedValue)
    */
    equals: function (value, testedValue) {  return isNotDefined(value) || angular.equals(value,testedValue); },

    /**
     * Check that field is not equal (using === operator) to an expected value: notEquals(expectedValue)
    */
    notEqual: function (value, testedValue) {  return isNotDefined(value) || !angular.equals(value,testedValue); },

    /**
     * Check that field is equal to true.
    */
    isTrue: function (value) { return isNotDefined(value) || value === true; },

    /**
     * Check that field is equal to false.
    */
    isFalse: function (value) { return isNotDefined(value) || value === false; },

    /**
     * Apply the result of a function execution as a constraint. Usefull to create custom constraint without registering them in the validator service
     * ```javascript
     * var rule = validator('Value must be pair').constraint(function(value) {
     *  return (value % 2) === 0;
     * });
     * ```
    */
    constraint: function (value, testedValue) {
      return testedValue;
    }


  };

  /*
    Contains a list of validation checks, that can be applyed to a unit field
    RulesClass instances are returned by calls to Validator.rule('error message'), ex: Validator.rule('error message').min(42)
  */
  var RuleClass = function (message) {
    this.message = message;
    this.rules = [];
  };

  // For each constraintfunction, construct a "chain invocation style function" for RuleClass
  function constructRuleClassFunction(constraintName) {
    return function () {
      var args = Array.prototype.slice.call(arguments);
      var rule = {
        constraint: constraintName,
        fct: constraintFunctions[constraintName]
      };
      if (args.length) {
        rule.args = args;
      }
      this.rules.push(rule);
      return this;
    };
  }

  for (var id in constraintFunctions) {
    RuleClass.prototype[id] = constructRuleClassFunction(id);
  }


  /*
  * Prototype of all the error objects
  */
  var ErrorClass = function() {};

  /*
  * Apply all the registered constraints to the input value,
  * returns undefined if all constraints are ok, else returns the rule object that was not validated
  */
  RuleClass.prototype.check = function (value, mainObject) {

    for (var i = 0; i < this.rules.length; i++) {
      var rule = this.rules[i];

      // Construct arguments of the called check function
      var args = [value];
      for (var j in rule.args) {
        if (typeof rule.args[j] === 'function') {
          args.push(rule.args[j](value, mainObject));
        } else {
          args.push(rule.args[j]);
        }
      }

      if (!rule.fct.apply(null, args)) {
        var error = new ErrorClass();
        error.constraint = rule.constraint;
        error.value = value;

        if (args.length > 1) {
          error.args = args.slice(1);
        }

        if (typeof this.message === 'function') {
          error.message = this.message(value, mainObject);
        } else {
          error.message = this.message;
        }

        return error;
      }
    }
  };

  /*
  Validate a simple field, and returns a promise
  */
  RuleClass.prototype.validate = function (value) {

    var deferred = $q.defer();

    var result = this.check(value);

    if (result !== undefined) {
      deferred.reject(result);
    } else {
      deferred.resolve();
    }

    return deferred.promise;
  };

  /*
  * Apply a list of validation rules to an object, constructed by Validator({...});
  */
  var RuleSetClass = function (ruleSet) {
    this.ruleSet = ruleSet;
  };

  RuleSetClass.prototype.check = function(object) {
    var errors = new ErrorClass();
    var inError = false;

    for (var propName in this.ruleSet) {
      // Using $parse, eval the value of the field on the input object
      var propGetter = $parse(propName);
      var propValue = propGetter(object);

      var rules = this.ruleSet[propName];

      if (!angular.isArray(rules)) {
        rules = [rules];
      }

      for (var i in rules) {
        var rule = rules[i];
        var error = rule.check(propValue, object);

        if (error !== undefined) {
          inError = true;
          // If propName expression match an assignable field -> use $parse assigner
          if (propGetter.assign !== undefined) {
            propGetter.assign(errors, error);
          }
          // Else directly assign it to errors object
          else {
            errors[propName] = error;
          }
          break;
        }
      }
    }
    if (inError) {
      return errors;
    }
  };


  /*
  * Validate an object, and returns a promise
  */
  RuleSetClass.prototype.validate = function (object) {
    var deferred = $q.defer();

    var errors = this.check(object);

    if (errors !== undefined) {
      deferred.reject(errors);
    } else {
      deferred.resolve();
    }

    return deferred.promise;
  };

  /*
    Validator service
  */
  var Validator = function (arg) {
    if (typeof arg === 'object') {
      return new RuleSetClass(arg);
    } else if (arg === undefined || typeof arg === 'string' || typeof arg === 'function' ) {
      return new RuleClass(arg);
    }
  };

  /*
  * Defines if the input object is an error object returned by rule.check or rule.validate
  */
  Validator.isError = function(errorObject) {
    return errorObject !== undefined && errorObject !== null && errorObject.constructor === ErrorClass;
  };


  return Validator;


}]);
