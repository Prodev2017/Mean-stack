'use strict';

var module = angular.module('docsx.url', ['ngMaterial']);

module.controller('UrlCtrl', ['$scope', '$mdDialog', 'url', function ($scope, $mdDialog, url) {
  $scope.form = {
  	url: url
  };

  /**
  * Handle the save click
  */
  this.save = function() {
    $mdDialog.hide($scope.form.url);
  };

  /**
  * Handle the cancel click.
  */
  this.cancel = function() {
  	$mdDialog.cancel();
  };

}]);
