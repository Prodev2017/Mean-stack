'use strict';


function on_gapi_loaded() {
  if (window.init_gapi) {
    window.init_gapi();
  } else {
    setTimeout(on_gapi_loaded, 10);
  }
}

var module = angular.module('docsx.gapi', []);

/**
 * Adapter for exposing gapi as an angular service. This registers a promise that will
 * resolve to gapi after all the APIs have been loaded.
 */
module.factory('googleApi', ['$rootScope', '$window', '$q', 'apiKey', 'loadApis', function($rootScope, $window, $q, apiKey, loadApis) {
  var googleApi = $q.defer();

  $window.init_gapi = function() {
    $rootScope.$apply(function() {
      var apis = [];
      if (apiKey) {
        $window.gapi.client.setApiKey(apiKey);
      }
      angular.forEach(loadApis, function(value, key) {
        apis.push($q.when(gapi.client.load(key, value)));
      });
      $q.all(apis).then(function() {
        googleApi.resolve($window.gapi);
      });
    });
  };

  return googleApi.promise;
}]);

