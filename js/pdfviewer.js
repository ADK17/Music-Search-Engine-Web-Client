var _PDFSCALEFACTOR;
var activePage,scaledViewport,fullViewport,scale,context;
var zoomCount = 0;
var resProps ={};
var pdfPage = 1;
var pdfPages = 1;
var zoomMode = false;
var downloadStart = 0,downloadTime,renderStart = 0,renderTime;
var g2pWasActiveGlobal;

function loadPDF(url,canvasF,callback,keepZoomCount){
  console.log("loadPDF"+url);
  if(!keepZoomCount)zoomCount = 0;
  downloadStart = new Date().getTime();
PDFJS.getDocument(url).then(function(pdf) {
  downloadTime = new Date().getTime() - downloadStart;
  downlaodStart = 0;
  // Using promise to fetch the page
  var numPages = pdf.numPages;
  pdfPages = numPages;

  pdf.getPage(1).then(function(page) {
    activePage = page;
    var viewport = activePage.getViewport(1);
    fullViewport=viewport;
    resProps.pdfX = viewport.width;
    resProps.pdfY = viewport.height;
  /*  var style = "width:"+scaledViewport.width+";height:"+scaledViewport.height+";";
    document.getElementById('pdflayers').setAttribute("style",style); /*For IE*/


    /*var zoom = 1.0;
    scale = zoom*scale;
    offsetX = scaledViewport.width * (Math.sqrt(zoom)-1) / -2;
    offsetY = scaledViewport.height * (Math.sqrt(zoom)-1) / -2;
    scaledViewport = new PDFJS.PageViewport(scaledViewport.viewBox, scale, scaledViewport.rotation, 0, 0);*/

    drawPdf(zoomCount,canvasF,callback);

  });
});

}

function drawPdf(zoom,canvasF,callback,callback2){
  zoomCount = zoom;
  var fitToPageBool = false;
  var windowHeight = window.innerHeight - 52;
  var windowWidth = window.innerWidth;

  if(zoom===0){
    fitToPageBool = true;
    $('#zoom-count').text('Fit To Page');
    var limitationFactor = (windowHeight/windowWidth)/(resProps.pdfY/resProps.pdfX);
    if(limitationFactor < 1){
      zoom = windowHeight / resProps.pdfY;
    }
    else{
      zoom = windowWidth / resProps.pdfX;
    }
  } else{
    var txt = parseInt(zoom*100);
    txt += '%';
    $('#zoom-count').text(txt);
  }
//jdw if(!zoom) zoom = 1;
  scaledViewport = activePage.getViewport(zoom);
  var leftAlign;
  if(fitToPageBool) leftAlign = (window.innerWidth - scaledViewport.width)/2;
  else leftAlign = 0;
    resProps.x=scaledViewport.width;
    resProps.y=scaledViewport.height;
    resProps.leftAlign=leftAlign;
    resProps.sf= 1/zoom;
    _PDFSCALEFACTOR = resProps.sf;

  /*Size pdfLayers container and Fabric.js Canvas*/
  var scope = angular.element($("#pdfLayers")).scope();
  //scope.setResProps(resProps);
  //scope.resizeFabric(resProps);
  canvasF.setWidth(resProps.x);
  canvasF.setHeight(resProps.y);
  //canvasF.renderAll.bind(canvasF);
  var pdfLayers = document.getElementById('pdfLayers');
  pdfLayers.style.width = resProps.x+'px';
  pdfLayers.style.height = resProps.y+'px';
  //document.getElementById('pdfLayers').style.left = resProps.leftAlign+'px';

  /*Size the PDF Canvas*/
  var canvas = document.getElementById('the-canvas');
  context = canvas.getContext('2d');
  canvas.width = scaledViewport.width;
  canvas.height = scaledViewport.height;
  //canvas.style.left = leftAlign+'px';
  if(fitToPageBool){
    var leftShift = 0;
    if(!scope.editorHeader.panelOpen()) leftShift = resProps.leftAlign;
    else if(resProps.leftAlign > 110){
      leftShift = resProps.leftAlign - 110;
    }
    pdfLayers.style.left = leftShift+'px';
    canvas.style.left = leftShift+'px';
    document.getElementById('zoom-panel').style.left = leftShift+'px';
    document.getElementById('zoom-dd').style.left = leftShift+'px';
    document.getElementById('roll-toolbar').style.left = leftShift+'px';
    //document.getElementById('markup-filter').style.left = leftShift+'px';
  } else {
    pdfLayers.style.left = '0px';
    canvas.style.left = '0px';
    document.getElementById('zoom-panel').style.left = '0px';
    document.getElementById('zoom-dd').style.left = '0px';
    document.getElementById('roll-toolbar').style.left = '0px';
    //document.getElementById('markup-filter').style.left = '0px';
  }
  console.log('making callback 1');
  if(callback)callback();
  //var newVP = new PDFJS.PageViewport([421,596,1263,1788], 2, scaledViewport.rotation, 0, 0);
  var renderContext = {
    canvasContext: context,
    viewport: scaledViewport
    //viewport: newVP
  };
//setTimeout(function(){angular.element('#markup-filter').scope().calcMarkupFilterTop()},100);
renderStart = new Date().getTime();
  activePage.render(renderContext).promise.then(function(){
    var t = new Date().getTime();
    renderTime = t - renderStart;
    renderStart = 0;
    sheetLoadTime(t,resProps,zoomCount,downloadTime,renderTime);
    downloadTime = 0;renderTime = 0;
    if(callback2)callback2();
});

}

function grabZoom(zoomBox,canvasF,callback){
    var zoomX = zoomBox[2] - zoomBox[0];
    var zoomY = zoomBox[3] - zoomBox[1];
    var windowHeight = window.innerHeight - 52;
    var windowWidth = window.innerWidth;
    var limitationFactor = (windowHeight/windowWidth)/(zoomY/zoomX);
    var scale,shift={};
    if(limitationFactor < 1){
      scale = windowHeight / zoomY;
      if(scale > 3) scale = 3;
      shift.y=zoomBox[1]*scale;
      var xMidPoint = (zoomBox[0] + zoomX/2)*scale;
      shift.x = xMidPoint - zoomX*scale/2;
    }else{
      scale = windowWidth / zoomX;
      if(scale > 3) scale = 3;
      shift.x=zoomBox[0]*scale;
      var yMidPoint = (zoomBox[1] + zoomY/2)*scale;
      shift.y = yMidPoint - zoomY*scale/2;
    }
    sheetLoad.start = new Date().getTime();
    drawPdf(scale,canvasF,function(){
      callback(shift);
    });
}

function zoom(zoomIn,directZoom,canvasF,callback,callback2){
  var inRange = true;
  if(!directZoom){
  if(zoomCount === 0) zoomCount = .5;
  if(zoomIn){
    if(zoomCount <= 2.75) zoomCount += .25;
    else{inRange = false;}
  } else{
      if(zoomCount >= .75) zoomCount -= .25;
      else zoomCount = 0;
    }
  } else{
    zoomCount = parseInt(zoomIn);
  }
    if(inRange){
      sheetLoad.start=new Date().getTime();
      console.log('in range, draw PDF');
      drawPdf(zoomCount,canvasF,callback,callback2);
    }
    else {
      callback(true);callback2();
    }
}

var zoomStep = .25;
var offsetX,offsetY;
