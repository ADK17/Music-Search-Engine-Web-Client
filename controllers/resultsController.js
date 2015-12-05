SearchEngineApp.controller('resultsController', function($scope,dataFactory,$routeParams) {

console.log("Results Controller");
$scope.results = dataFactory.get();
console.log($scope.results);
})