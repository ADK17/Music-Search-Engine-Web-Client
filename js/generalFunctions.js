/*
 * Input: Takes unix timestamp and returns formated date
 * Default: format: Aug. 23, 1:23pm
 * justDate{bool}: returns only the date ex: Aug. 23
 * mdt{bool}: mdt=Month-Date-time, ex: 8/23, 1:23pm
 */
function formatDate(unixtime,justDate,mdt){
var monthNames = [
        "Jan.", "Feb.", "Mar.",
        "Apr.", "May", "June", "July",
        "Aug.", "Sep.", "Oct.",
        "Nov.", "Dec."
    ];
    var aOrP = 'am';
var date = new Date(unixtime);
var day = date.getDate();
var monthIndex = date.getMonth();
var result = monthNames[monthIndex]+" "+day;
if(justDate) return result;
else{
result += ", ";
var hours = date.getHours();
var mins = date.getMinutes();
if(mins<10) mins = '0'+mins;
if(hours === 0) hours = 12;
else if(hours >= 12){
  aOrP = 'pm'
   if(hours !==12)hours-=12;
 }
hours +=":"+mins+aOrP;
result+=hours;//+')';
if(mdt) return monthIndex+'/'+day+', '+hours;
else return result;
}
}
function toInt(n){ return Math.round(Number(n)); };

function hideOpStatus(){
  $('#operation-status').html('');
}

function getThumbnails(projectID,callback){
   $.ajax({
       type: 'GET',
       dataType: "jsonp",
       url: "http://demoaws.rolloutaec.com:8082/projectThumbs",
       data: {projectID : projectID},
       success: function (data){
         console.log(data);
         if(callback) callback();
       }
   });
   //var fetchThumbs = setInterval(function(){ getSheetsinProject(projectId);console.log('getsheets interval'); }, 10000);
}

function dotproduct(a,b) {
	var n = 0, lim = Math.min(a.length,b.length);
	for (var i = 0; i < lim; i++) n += a[i] * b[i];
	return n;
 }
