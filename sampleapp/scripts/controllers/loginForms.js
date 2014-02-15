angular.module('sampleApp').controller('LoginFormCtrl', function ($scope, Validator) {

  var validationRules = Validator({
    'login': [
      Validator('Login is required').required(),
      Validator('Login must be a valid email address').email()
    ],
    'password': Validator('Password is required').required()
  });

  $scope.submit = function () {
    delete $scope.errors;
    delete $scope.message;

    validationRules.validate($scope).then(function ok() {
      $scope.message = 'Login Success !';
    }, function ko(errors) {
      $scope.errors = errors;
    });
  };
});