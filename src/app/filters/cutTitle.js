'use strict';

var module =  angular.module('docsx');

module.filter('cutTitle', [ function() {
    return function(title) {
        if(title.length > 16){
            return title.substring(0,16) + '...';
        }
        return title;
    };
}])