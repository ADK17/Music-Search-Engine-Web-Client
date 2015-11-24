var app = angular.module('SearchEngine',[])

app.controller('mainController',function($scope, $location){
    
    console.log("Main Controller");
    $scope.searchString;
    $scope.results=[];
    console.log($location.path());
     $scope.isActive = function (viewLocation) { 
        return viewLocation === $location.path();
    };
    
    $scope.search = function(){
        console.log($scope.searchString);
        if($scope.searchString=="")return;
            $.ajax({
         url: 'http://localhost:8080/SearchEngineService/webapi/myresource/search',
         type: 'POST',
         headers: {
                'songName':$scope.searchString
        },
         beforeSend: function(xhr) {
      xhr.setRequestHeader( "Content-type", "text/plain" );
    },
         crossDomain:true,
         success: function (data){
            $scope.results=data;
            console.log(data.urls);
             //console.log($scope.results);
             $scope.$apply();
         },
         error: function(error){
           console.log(error);
         }
     });
    }
    

})
