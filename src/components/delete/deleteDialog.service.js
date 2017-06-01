'use strict';

angular.module('docsx.delete').service('deleteDialog', ['$mdDialog', function ($mdDialog) {
  /**
   * Displays a dialog for renaming the file.
   *
   * @param {Event} $event Original click event for animations
   * @param {String} title Original document title
   * @return {Promise} Promise that resolves with the new title when the dialog is closed
   */
  this.show = function($event, title, topMessage, message, psMessage) {
    return $mdDialog.show({
      targetEvent: $event,
      templateUrl: "components/delete/delete.html",
      controller: 'DeleteCtrl',
      controllerAs: 'ctrl',
      locals: {
        title: title,
        topMessage: topMessage,
        message: message,
        psMessage: psMessage
      }
    });
  };
}]);
