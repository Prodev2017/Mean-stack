'use strict';

angular.module('docsx.rename').service('renameDialog', ['$mdDialog', function ($mdDialog) {
  /**
   * Displays a dialog for renaming the file.
   *
   * @param {Event} $event Original click event for animations
   * @param {String} title Original document title
   * @return {Promise} Promise that resolves with the new title when the dialog is closed
   */
  this.show = function($event, title) {
    return $mdDialog.show({
      targetEvent: $event,
      templateUrl: "components/rename/rename.html",
      controller: 'RenameCtrl',
      controllerAs: 'ctrl',
      clickOutsideToClose: true,
      locals: {
        title: title
      }
    });
  };
}]);
