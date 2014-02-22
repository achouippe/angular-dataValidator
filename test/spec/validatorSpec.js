'use strict';

describe('validator', function () {

  beforeEach(module('dataValidator'));

  var Validator;

  beforeEach(function () {
    inject(function($injector) {
      Validator = $injector.get('Validator');
    });
  });

  // Just test Validator injection
  it('Validator should be defined', function () {
    expect(Validator).toBeDefined();
  });


});