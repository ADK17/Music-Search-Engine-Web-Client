SearchEngineApp.controller('mainController',function($scope,dataFactory,$sce){
    
    console.log("Main Controller");
    $scope.searchString;
    $scope.results=[];
    $scope.searchPage=true;
    $scope.title;
    $scope.album;
    $scope.artist;
    $scope.qeInput=[];
    $scope.albumart="http://placehold.it/350x150";
    $scope.genre;
    $scope.showSimilarPages=true;
    $scope.showDetails = false;
    $scope.bingSearchQuery;
    $scope.qeOutput;
    $scope.cluster=[];
    $scope.count=0;

    var searchControl = new google.search.SearchControl();
    searchControl.addSearcher(new google.search.WebSearch());
    searchControl.draw(document.getElementById("actual-google"));
    
    $scope.search = function(){
        
        $scope.count=0;
        
        if($scope.searchString=="")return;
       
        $scope.albumart="http://placehold.it/350x300";
        
        //search api call
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
            dataFactory.set(data);
             console.log(data);
             $scope.initResultsPage();

            data.forEach(function(record){
            $scope.qeInput.push("id;"+record.album+";"+record.albumArt+";"+record.artist+";"+record.description+";"+record.genre+";"+record.pageTitle+";"+record.title+";"+record.url);
            });            
    
            var input = {
            "queryText":$scope.searchString,
            "matchingDocs":$scope.qeInput
            }


            //query expansion api call  
            $.ajax({
                     url: 'http://192.168.0.24:8080/queryexpansion/qe/getexpquery',
                     type: 'POST',
                     beforeSend: function(xhr) {
                  xhr.setRequestHeader( "Content-type", "application/json" );
                },
                    data:JSON.stringify(input),         
                     crossDomain:true,
                    processData:false,
                     success: function (data){                  
                         console.log(data);
                         $scope.qeOutput=data;
                         
                         $scope.$apply();
                       

                     },
                     error: function(error){
                       console.log(error);
                     }
                 });
            
         },
         error: function(error){
           console.log(error);
         }
     });
        searchControl.execute($scope.searchString);
    }
 
$scope.initResultsPage = function(){
    
    $scope.results=dataFactory.get();
    $scope.bingSearchQuery=$sce.trustAsResourceUrl("http://www.bing.com/search?q="+$scope.searchString.replace(' ', '+'));
    $scope.searchPage=false;   
    //console.log($scope.results[0].title); 
    $scope.title = $scope.results[0].title;
    $scope.album = $scope.results[0].album;
    $scope.artist = $scope.results[0].artist;
    $scope.genre = $scope.results[0].genre;
    if($scope.results[0].albumArt!=null)
    $scope.albumart =  $scope.results[0].albumArt;
    
    $scope.$apply();
}

})
