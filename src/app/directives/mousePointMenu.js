'use strict';

var module = angular.module('docsx');

module.directive('mousepointMenu', [function () {
    return {
        restrict: 'A',
        require: 'mdMenu',
        link: function ($scope, $element, $attrs, RightClickContextMenu) {

            var prev = { x: 0, y: 0 }
            $scope.$mdOpenMousepointMenu = function ($event) {
                RightClickContextMenu.offsets = function () {
                    var mouse = {
                        x: $event.clientX,
                        y: $event.clientY
                    }
                    var offsets = {
                        left: mouse.x - prev.x,
                        top: mouse.y - prev.y
                    }
                    prev = mouse;

                    return offsets;

                }
                RightClickContextMenu.open($event);
            };
        }

    };
}]);