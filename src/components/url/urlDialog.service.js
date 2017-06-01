'use strict';

angular.module('docsx.url').service('urlDialog', ['$mdDialog', function ($mdDialog) {

  this.show = function($event, url) {
    return $mdDialog.show({
      targetEvent: $event,
      templateUrl: "components/url/url.dialog.html",
      controller: 'UrlCtrl',
      controllerAs: 'ctrl',
      clickOutsideToClose: true,
      locals: {
        url: url
      }
    });
  };
}]);
