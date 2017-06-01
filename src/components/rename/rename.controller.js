'use strict';


var module = angular.module('docsx.rename', ['ngMaterial']);

module.controller('RenameCtrl', ['$scope', '$mdDialog', 'title', function ($scope, $mdDialog, title) {
  $scope.form = {
  	title: title
  };

  /**
  * Handle the save click
  */
  this.save = function() {
    $mdDialog.hide($scope.form.title);
  };

  /**
  * Handle the cancel click.
  */
  this.cancel = function() {
  	$mdDialog.cancel();
  };

}]);
