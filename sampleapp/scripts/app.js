'use strict';

angular.module('sampleApp', ['ngRoute', 'dataValidator'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/loginFormTopMessages', {
        templateUrl: 'views/loginFormTopMessages.html',
        controller: 'LoginFormCtrl'
      })
      .when('/loginFormLocalMessages', {
        templateUrl: 'views/loginFormLocalMessages.html',
        controller: 'LoginFormCtrl'
      })
      .when('/signupForm', {
        templateUrl: 'views/signupForm.html',
        controller: 'SignupFormCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
