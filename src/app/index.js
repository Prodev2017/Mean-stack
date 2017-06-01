'use strict';


// Configure our app
angular.module('docsx', ['docsx.login', 'docsx.rename', 'docsx.delete', 'docsx.drive', 'ngRoute', 'ngMaterial', 'as.sortable','puElasticInput', 'docsx.url'])
  .constant('apiKey', null)
  .constant('clientId', '158251217374-5s2k32uan5g1hof134u37d1j2u0957u1.apps.googleusercontent.com')
  .constant('applicationId', 'kvw_JI8Keu7LX4q0TEyavpRi')
  .constant('scope', ['email', 'profile', 'https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/drive.install'])
  .constant('loadApis', {
    'drive' : 'v2'
  })
  .config(function ($routeProvider) {
    $routeProvider
      .when('/edit/:fileId?', {
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl',
        controllerAs: 'ctrl'
      })
      .otherwise({
        redirectTo: function() {
          console.log("Otherwise...");
          return '/edit/';
        }
      });
  }).config(function($mdThemingProvider) {
  $mdThemingProvider.theme('altTheme')
    .primaryPalette('light-blue')
    .warnPalette('blue'); 
$mdThemingProvider.setDefaultTheme('altTheme');
});
