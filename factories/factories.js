SearchEngineApp.factory('dataFactory', function($rootScope) {
  var _searchResults;
  service = {};
  
  service.get = function() {
    if (_searchResults) {
      return _searchResults;
    } else {
      return false;
    }
  }
  service.set = function(results) {
    _searchResults = results;
  }
 
  return service;
})