var SearchEngineApp = angular.module('SearchEngineApp', ['ngRoute'])

// configure our routes
SearchEngineApp.config(function($routeProvider) {
  $routeProvider
  /// route for the contact page
    .when('/results', {
      templateUrl: 'views/results.html',
      controller: 'resultsController'
    });

});
