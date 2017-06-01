'use strict';

var module = angular.module('docsx');

module.directive('keypressEvents', function ($document) {
    return {
        restrict: 'A',
        link: function () {
            $document.bind('keyup', function (e) {
                if (e.keyCode == 27) {
                    console.log('ESC');
                    if (angular.element('.dcs-s-dcs-t').length > 0) {
                        console.log('dsfsgf');
                        angular.element('.dcs-s-dcs-t').remove();
                    }
                    if (angular.element('.dcs-s-dcs-t-dcs-xb').length > 0) {
                        console.log('sdsdfs');
                        angular.element('.dcs-s-dcs-t-dcs-xb').remove();
                    }
                }
                // alert(e.keyCode);
            });
        }
    }
});