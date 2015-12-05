//var app = angular.module('SearchEngine',[])

SearchEngineApp.controller('mainController',function($scope,$routeParams,dataFactory){
    
    console.log("Main Controller");
    $scope.searchString;
    $scope.results=[];
    
//    console.log($location.path());
//     $scope.isActive = function (viewLocation) { 
//        return viewLocation === $location.path();
//    };
    
    $scope.search = function(){
        console.log("Kuthay?");
        console.log(window.location.href);
//
      window.location.href ="/#/views/results";
//        
//        console.log($scope.searchString);
//        if($scope.searchString=="")return;
//            $.ajax({
//         url: 'http://localhost:8080/SearchEngineService/webapi/myresource/search',
//         type: 'POST',
//         headers: {
//                'songName':$scope.searchString
//        },
//         beforeSend: function(xhr) {
//      xhr.setRequestHeader( "Content-type", "text/plain" );
//    },
//         crossDomain:true,
//         success: function (data){
//            $scope.results=data;
//            dataFactory.set($scope.results);
//             //console.log($scope.results[0].title);  
//             $scope.$apply();
//             window.location.href="/views/results.html";
//             //window.location.href="/results.html";
//            // console.log(dataFactory.get()); 
//         },
//         error: function(error){
//           console.log(error);
//         }
//     });
    }
    

})
