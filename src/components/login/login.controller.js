'use strict';


var module = angular.module('docsx.login', ['docsx.gapi', 'ngMaterial']);

module.controller('LoginCtrl', ['$mdDialog','login', 'user', function ($mdDialog, loginService, user) {
  /**
   * Handle the login click.
   */
  this.login = function() {
    loginService.login(user).then(function() {
   		$mdDialog.hide();
    });
  };
}]);
