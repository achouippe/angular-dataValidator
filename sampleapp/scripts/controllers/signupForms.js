angular.module('sampleApp').controller('SignupFormCtrl', function ($scope, Validator) {

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
    ],
    'account.passwordConfirm': [
      Validator('Please confirm your password').required(),
      Validator('Entered password are not equal').equal(function() {return $scope.account.password; })
    ],
    'acceptTerms': Validator('You must agree the terms of service to sign up').required().isTrue()
  });

  $scope.submit = function () {
    delete $scope.errors;
    delete $scope.message;

    validationRules.validate($scope).then(function ok() {
      $scope.message = 'Success !';
    }, function ko(errors) {
      $scope.errors = errors;
    });
  };
});