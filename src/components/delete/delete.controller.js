'use strict';

var module = angular.module('docsx.delete', ['ngMaterial']);

module.controller('DeleteCtrl', ['$scope', '$mdDialog', 'title', 'topMessage', 'message', 'psMessage', function ($scope, $mdDialog, title, topMessage, message, psMessage) {
  $scope.form = {
  	title: title,
    topMessage: topMessage,
    message: message,
    psMessage: psMessage
  };

  /**
  * Handle the save click
  */
  this.delete = function() {
    $mdDialog.hide($scope.form.title);
  };

  /**
  * Handle the cancel click.
  */
  this.cancel = function() {
  	$mdDialog.cancel();
  };
}]);
