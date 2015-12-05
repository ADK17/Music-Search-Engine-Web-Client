var markupColorArray = ['#000','#FFF','#F00','#00CC00','#00F']
var cloudSegments = {};
var cRadius = 4;

markupColorArray.forEach(function(color){
  var base = new fabric.Group([
      drawRidge(cRadius,0,0,180,color)
    ]);
  var groups = [base];
  for(i=0;i<9;i++){
    var oldGroup = fabric.util.object.clone(groups[i]);
    var newGroup = fabric.util.object.clone(groups[i]);
    newGroup.left+= cRadius*Math.pow(2,i+1);
    groups.push(
      new fabric.Group([
          oldGroup,
          newGroup
        ])
    );
  }

  var yBase = new fabric.Group([
      drawRidge(cRadius,0,0,90,color)
    ]);
  var yGroups = [yBase];
  for(i=0;i<9;i++){
    var oldGroup = fabric.util.object.clone(yGroups[i]);
    var newGroup = fabric.util.object.clone(yGroups[i]);
    newGroup.top+= cRadius*Math.pow(2,i+1);
    yGroups.push(
      new fabric.Group([
          oldGroup,
          newGroup
        ])
    );
  }
  cloudSegments[color] = {x:groups,y:yGroups}
})



function drawRidge(rad, left, top, ang, color) {
    return new fabric.Circle({
        hasControls: false,
        hasBorders: false,
        radius: rad,
        left: left,
        top: top,
        angle: ang,
        startAngle: 0,
        endAngle: Math.PI,
        stroke: color,
        strokeWidth: 1,
        fill: '',
        borderColor: '#e8420a',
        cornerColor: '#e8420a',
        transparentCorners: false,
        selectionLineWidth: 10,
        hasRotatingPoint: false,
        lockRotation: true
    });
}
