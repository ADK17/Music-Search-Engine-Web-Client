Parse.initialize("TJMydt5zGRU8I4NNJqONE5PBPOdiStmh7JlphyFR", "omgwtIOcwpWaduwTN3wvbEoCxWntMXHUiZpl6rZJ");
var g2p;
// current loaded sheet

// Function to signup user through parse
 function rollSignup(user){

   var user = new Parse.User();
   var rFirst = user.firstName;
   var rLast = user.lastName;
   var rEmail = user.email;
   var rPass = user.pass;
   var rPhone = user.phone;
   var rCompany = user.companyName;
   user.set("firstName",rFirst);
   user.set("lastName",rLast);
   user.set("username", rEmail);
   user.set("password", rPass);
   user.set("email", rEmail);
   user.set("companyName", rCompany);
   user.set("phone", rPhone);

  return user.signUp(null, {
    success: function(user) {
      Parse.Cloud.run('newStripeUser', { userId: user.id }, {
        success: function(res) {
          return res;
        },
        error: function(error) {
          console.err('error creating stripe user: '+error);
          return error;
        }
      });
    },
    error: function(user, error) {
      // Show the error message somewhere and let the user try again.
      // we can add more checking for parse error codes here
      if (error.code === 202) {
          return 'usernameTaken';
      }
      else { return 'error'; }
    }
  });
 }

 // Function to login user through parse
 // TODO: Remove rollLoin. replaced in loginController
 function rollLogin(user) {
     var username = user.email;
     var pass = user.pass;

     return Parse.User.logIn(username, pass, {
        success: function(user) {
            // Do stuff after successful login.
            return 'success';
        },
        error: function(user, error) {
            // The login failed. Check error to see why.
            // we can add more error checking here for parse error codes
            if (error.code === 101) {
                return 'invalidCredentials';
            }
            else return 'error';
        }
    });
 }

 // Function to get the current user (if they are already logged in)
 function rollGetUser() {
     return Parse.User.current();
 }

 // Function to logout the user
 function rollLogout() {
     Parse.User.logOut();
     window.location.href = "/#/";
 }

 function getProjects(callbackActive,callbackNew){
   var userProjects = Parse.User.current().relation("projects");
   var query = userProjects.query();
   query.ascending("prName");
   query.find({
     success: function(list) {
       var projObj = {};
       list.forEach(function(object) {
                 object.title = object.get('prName');
                 var prType = object.get('type') ? object.get('type'):'standard';
                 projObj[object.id] = {
                   name:object.get('prName'),
                   owner:object.get('creator'),
                   type:prType
                 }
       });
       if(callbackActive)callbackActive(list,projObj);
     }
   });
   var ppi = Parse.Object.extend("pendingProjectInvites");
   var query = new Parse.Query(ppi);
   query.equalTo("user",Parse.User.current());
   query.first({
     success: function(pendingProjects){
       var projects = pendingProjects.relation("pendingProjects");
       projects.query().find({
         success: function(newProjectList) {
           if(callbackNew)callbackNew(newProjectList);
         }
       });
     }
   });
 }

 //get project list
 function getSheet(id,revNum,callback,canvasF,callback2){
   if(revNum) revNum = parseInt(revNum);
   var GameScore = Parse.Object.extend("Sheets");
  var query = new Parse.Query(GameScore);
  query.equalTo("sheetID", id);
  //sheetVersion
  query.descending("sheetVersion");
  query.find({
    success: function(results) {
      var revArray = [];
      for (var i=0; i<results.length; i++) {
        revArray.push({
          num:results[i].get("sheetVersion"),
          date:formatDate(results[i].createdAt),
          revSet:results[i].get("revSet"),
          url:results[i].get("PDF").url()
        });
    }

    var revIndex;
    if(revNum) revIndex = _.findIndex(revArray,{num:revNum});
    else revIndex = 0;
    loadPDF(results[revIndex].get('PDF').url(),canvasF,callback2);
    callback(revArray,results[revIndex],revArray[revIndex]);
    },
    error: function(error) {
      alert("Error: " + error.code + " " + error.message);
    }
  });
 }

 function getSheetNum(id, vnum,callback){
   //todo plugin userid

   var GameScore = Parse.Object.extend("Sheets");
  var query = new Parse.Query(GameScore);
  query.equalTo("sheetID", id);
  //mod to allow complete dropdown for revisions to be built when passing rev number
  //direct sheet version query renders one result vs loading all revisions for dropdown.
  //query.equalTo("sheetVersion", vnum);
  query.find({
    success: function(results) {
      var thisRev;
      var revArray = [];
      var activeRev = {};
      var revInfo = {};
      for (var i = 0; i < results.length; i++) {
        revArray.push({
          num:results[i].get("sheetVersion"),
          date:formatDate(results[i].createdAt),
          revSet:results[i].get("revSet")
        });
        var object = results[i];
    if(object.get('sheetVersion') == vnum){
      thisRev = object;
      activeRev.date = formatDate(object.createdAt);
      activeRev.num = vnum;
      activeRev.revSet = object.get("revSet")
      sheetN = object.get('sheetName');
     loadPDF(object.get('PDF').url());
     currentSheet = object;
    }
      }
      revInfo.revArray = revArray;
      revInfo.activeRev = activeRev;
      callback(revInfo,thisRev);
    },
    error: function(error) {
      alert("Error: " + error.code + " " + error.message);
    }
  });
 }

function getProjectSheetsNew(pid,callback){
  var query1 = new Parse.Query("Projects");
  query1.get(pid,{
    success:function(project){
      //var relation = project.relation("sheets");
      //var query = relation.query();
      var query = new Parse.Query("Sheets");
      query.equalTo('parent',project);
      query.limit(1000);
      query.descending("sheetVersion");
      query.find({
      success: function(sheets) {
        organizeSheets(sheets,pid,callback);
      }
    });
    }
  })
}


function organizeSheets(sheets,parentId,callback){
  var sheetObj = {};
  sheetObj.all = sheets;
  var currentIDs = [];
  sheetObj.pending = [];

  var index = 0;
  sheets.forEach(function(object){
    if(object.get('sheetID').indexOf('upload')<0)
    {
           var pdfURL = 'http://placehold.it/223x178';
           var thumbURL = 'http://placehold.it/223x178';
          if(object.has('PDF')){
            pdfURL = object.get('PDF').url();
          }
          if(object.has('thumb')){
            thumbURL = object.get('thumb').url();
          }
          var sheetName = object.get('sheetName');
          var sheetId = object.get('sheetID');
          var labels = [];
          if(object.has("labels")) labels = object.get("labels");
             var date = formatDate(object.createdAt);
             object.current=false;object.title = sheetName;object.sheetid = sheetId;object.parseId = object.id;object.thumb= thumbURL;object.sheetVersion=object.get("sheetVersion");object.revSet=object.get("revSet");object.revSearchString=object.get("revSet");object.pdfURL=pdfURL;object.projectId=parentId;object.date=date;object.shopDrawing=object.get("shopDrawing");object.labels=labels;

            var newerRev = _.findWhere(sheets, {sheetid:object.sheetid,current:true});
            if(newerRev==null){
              object.current = true;
              object.revs = [];
            }
            else {
              newerRev.revs.push({sheetVersion:object.sheetVersion,revSet:object.revSet,createdAt:object.createdAt});
              newerRev.revSearchString +=" "+ object.revSet;
            }
}
else{
  var sheetName = object.get('Extracted_Sheet_Name');
  if(sheetName==='none') sheetName = '';
  object.uploadWizardObject =  {
               sheetName: sheetName,
               preview: 'http://placehold.it/200x153',
               url: object.get('PDF').url(),
               filename: object.get('PDF').name().substring(42,object.get('PDF').name().length),
               xFilename: object.get('PDF').name().substring(42,object.get('PDF').name().length)
   };
   object.current = false;
    sheetObj.pending.push(object);
}
  })
  if(callback) callback(sheetObj);
}

//gets cropped previews for sheets and populates the upload wizard with all the data
function getPreview(url,callback){
         $.ajax({
           type: 'GET',
           dataType: "jsonp",
           url: "http://demoaws.rolloutaec.com:8082/genPreview",
           data: {url : url},
           success: function (data){
              callback(data.thumbNail);
            }
         });
}


//Guid
var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();
function shortGuid() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1)+Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
}


var monthNames = [
       "January", "February", "March",
       "April", "May", "June", "July",
       "August", "September", "October",
       "November", "December"
   ];


function buildMyUserList(myUserList,myUserObject){
  if(myUserList && myUserObject){
var myProjects = Parse.User.current().relation("projects");
myProjects.query().find({
  success: function(projects) {
    _.each(projects, function(project){
      var projectUsers = project.relation("users");
      projectUsers.query().find({
        success: function(users){
          _.each(users, function(user){
          if (!myUserObject[user.id]) {
              var profPic;
              if(user.get('profilePic')==null || user.get('profilePic')== undefined)profPic='img/default-prof-pic.png';
              else profPic= user.get('profilePic').url();
                var obj = { label: user.get("firstName")+" "+user.get("lastName")+" ("+user.get("username")+")", value: user.get("username"),id:user.id,img:profPic }
                myUserList.push(obj);
                var obj2 = {name:user.get("firstName")+" "+user.get("lastName"),img:profPic}
                myUserObject[user.id] = obj2;
          }
        });
        }
      });
    });
  }
});

} else console.log('buildMyUserList getting called from somewhere else');
}

function buildFilterArray(array,x,first,labels,callback){
  console.log(labels);
  if(first){
    var y = x;
    x++;
    array = _.intersection(labels[x].sheets,labels[y].sheets);
  }
  else{
    console.log(x,labels[x]);
    array = _.intersection(array,labels[x].sheets);
  }
  x++;
  if(array.length === 0)callback([]);
  else if(x < labels.length) buildFilterArray(array,x,false,labels,callback);
  else callback(array);
}

function getProjectUsers(project,callback){
 var users = project.relation("users");
    var query = users.query();
    query.limit(1000);
    query.find({
      success:function(projectUsers){
          var userArray = {};
          var i=1;
          projectUsers.forEach(function(user){
            var profPic;
            if(user.get('profilePic')){
                profPic = user.get('profilePic').url();
            }
            else profPic = '/img/default-profile-pic-75.png';
             userArray[user.id] = {
                    id:i,
                    name:user.get('firstName')+' '+user.get('lastName'),
                    img:profPic,
                    type:'contact',
                    email:user.get('username'),
                    company:user.get('companyName')
                 }
                 userArray[user.id].lowerName = userArray[user.id].name.toLowerCase();
             i++;
          });
          callback(userArray);
      }
    })
}

function sheetView(pid,sid,viewedFrom){
  var Analytics = Parse.Object.extend('Analytics');
  var entry = new Analytics();
  entry.set('event','sheet-view');
  entry.set('userID',Parse.User.current().get('username'));
  var data = {pid:pid,sid:sid,via:viewedFrom}
  entry.set('data',data);
  entry.save();
  sheetLoad = {
    start:new Date().getTime(),
  pid:pid,
  sid:sid
}
}

var sheetLoad = {};
function sheetLoadTime(endLoad,resProps,zoom,dTime,rTime){
  var Analytics = Parse.Object.extend('Analytics');
  var entry = new Analytics();
if(sheetLoad.start){
  entry.set('event','sheet-load-time');
  entry.set('userID',Parse.User.current().get('username'));
  var totalTime = endLoad - sheetLoad.start;
  var data = {path:window.location.hash,time:{total:totalTime,render:rTime,download:dTime},res:resProps,zoom:zoom}
  entry.set('data',data);
  entry.save();
  sheetLoad.start = false;
} else{
   entry.set('event','sheet-reload');
   entry.set('userID',Parse.User.current().get('username'));
   entry.set('data',{path:window.location.hash});
   entry.save();
}
}

function scaleProfPic(){
  Parse.Cloud.run('scaleProfPic', { msg:'cloudcode hey' }, {
        success: function(res) {
          console.log(res);
        },
        error: function(error) {
          console.log(error);
        }
      });
}

function queryMarkups(pathArray,key,val,callback){
  Parse.Cloud.run('queryMarkups',{
    pathArray: pathArray,
    key: key,
    val: val
  },{
    success:function(res){
      console.log(res);
      if(callback)callback(res);
    },
    error:function(error){
      console.log(error);
    }
  })
}

function getMarkupList(pathArray,key,val,callback){
  var baseUrl = 'https://rollout.firebaseio.com/';
  var baseRef = new Firebase(baseUrl);
  baseRef = baseRef.child(pathArray[0]).child(pathArray[1]).child(pathArray[2]).child(pathArray[3]);
  var markups = []
  queryMarkups(pathArray,key,val,function(matches){
    var count = 0;
    matches.forEach(function(match){
      var obj = {},callCount=0;
      fetchMupObj(match,function(res){
        obj.markup = res;
        fetchDone();
      });
      fetchCmtArray(match,function(res){
        obj.comments = res;
        fetchDone();
      });

      function fetchDone(){
        console.log('fetchDone',obj);
        callCount++;
        if(callCount > 1){
          markups.push(obj);
          count++;
          if(count === matches.length) callback(markups);
        }
      }
    })
  })

  function fetchMupObj(props,callback){
    var thisRef = baseRef.child('markups').child(props.sid).child(props.uid).child(props.mid);
    console.log(thisRef.toString());
    thisRef.once('value',function(data){
      console.log(data.val());
      callback(data.val());
    })
  }
  function fetchCmtArray(props,callback){
    var thisRef = baseRef.child('comments').child(props.sid).child(props.uid).child(props.mid);
    thisRef.once('value',function(data){
      callback(data.val());
    })
  }
}

// getMarkupList(["projects","standard","upIy9S4dhT","AuX7AKEMLl","markups"],
// "metaType",
// "RFI",function(x){
//   console.log(x);
// })
