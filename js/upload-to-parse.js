//Use these functions to upload directly to Parse.
var fileCount,progCount;
var uploadedIDs = [];
function sendToParse(files,i,setName,callback){
  if(i === 0) {fileCount = 0;progCount=0;}

  var fileToSend=files[i];

  var thisSheetId = files[i].name+"-"+guid();
      versionNumber = 1;
      /*duplicated in both if and else*/
         var validParseName = files[i].name.substring(0,files[i].name.length).replace(/[^a-zA-Z0-9.-]/g,"");
       var pdfFile = new Parse.File(validParseName, files[i]);

        // Declare the types.
       var Project = Parse.Object.extend("Projects");
       var Sheets = Parse.Object.extend("Sheets");

       // Create the post
       var myProject = new Project();
       myProject.id = projectId;
       // Create the comment
       var mySheets = new Sheets();

       mySheets.set("PDF", pdfFile);
       mySheets.set("sheetName", files[i].name);
       mySheets.set("sheetVersion", versionNumber);
       mySheets.set("revSet", setName);
       mySheets.set("uploadedBy", Parse.User.current().id);
       mySheets.set("sheetID", thisSheetId);
       mySheets.set("parent", myProject);
       mySheets.save(null, {
           success: function(sheet) {

            progCount++;
            i++;
                      console.log(progCount+" out of "+files.length);
                      var percComplete = parseInt((progCount / files.length)*100);
                      percComplete = percComplete+"%";
                      angular.element('#uploadProgress-bar').css({"width":percComplete});
                      if(progCount%5===1 || progCount === files.length)setTimeout(function(){  getSheetsinProject(projectId); }, 500);
                      if(progCount < files.length) sendToParse(files,i,setName,callback);
                      else{
                        callback();
                        getThumbnails(projectId);
                      }

           },
           error: function(sheet, error) {
               alert("Something went wrong with the sheet upload.");
           }
         });
}

function newRevToParse(file,setName,sheetID,version,callback){
  var validParseName = file.name.substring(0,file.name.length).replace(/[^a-zA-Z0-9.-]/g,"");
  var pdfFile = new Parse.File(validParseName, file);

  var Project = Parse.Object.extend("Projects");
  var Sheets = Parse.Object.extend("Sheets");

  var myProject = new Project();
  myProject.id = projectId;
  var mySheets = new Sheets();

  mySheets.set("PDF", pdfFile);
  mySheets.set("sheetName", file.name);
  mySheets.set("sheetVersion", version);
  mySheets.set("revSet", setName);
  mySheets.set("uploadedBy", Parse.User.current().id);
  mySheets.set("sheetID", sheetID);
  mySheets.set("parent", myProject);
  mySheets.save(null, {
      success: function() {
        callback();
        getThumbnails(projectId);
      },
      error: function(sheet, error) {
          alert("Something went wrong with the sheet upload.");
      }
    });
}
