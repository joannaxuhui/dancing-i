var gl;
var canvas;
var shaderProgram;
// Create a place to store vertex positon
var vertexPositionBuffertop;
var vertexPositionBuffermid;
var days=0;

// Create a place to store vertex colors
var vertexColorBuffertop;
var vertexColorBuffermid;

var smalcortop;
var smalcormid;
var flag=0;
var mvMatrix = mat4.create();
var rotAngle = 0;
var lastTime = 0;
var framecount = 0;

//initial position which used for dynamic draw

//the top triangle-fan
var triangleVertices_inittop= [
          0.12, 1.00, 0.0,
          -0.50, 1.00,  0.0,
          -0.5,  0.75,  0.0,
          0.00,  0.75,  0.0,
          0.00,  -0.75,  0.0,
          0.25,  0.75,  0.0,
          0.75,  0.75,  0.0,
          0.75,  1.00,  0.0
];
//the bottom triangle-fan
var triangleVertices_initmid = [
          
          0.12, -1.00, 0.0,
          0.75, -1.00, 0.0,
          0.75, -0.75, 0.0,
          0.25, -0.75, 0.0,
          0.25, 0.75,  0.0,
          0.00, -0.75, 0.0,
          -0.50,-0.75, 0.0,
          -0.50,-1.00, 0.0
         
];


var triangleVerticestop = [
          0.12, 1.00, 0.0,
          -0.50, 1.00,  0.0,
          -0.5,  0.75,  0.0,
          0.00,  0.75,  0.0,
          0.00,  -0.75,  0.0,
          0.25,  0.75,  0.0,
          0.75,  0.75,  0.0,
          0.75,  1.00,  0.0
          
];

var triangleVerticesmid= [
          0.12, -1.00, 0.0,
          0.75,  -1.00,  0.0,
          0.75,  -0.75,  0.0,
          0.25, -0.75, 0.0,
          0.25,  0.75,  0.0,
          0.00,  -0.75,  0.0,
          -0.5,  -0.75,  0.0,
          -0.50, -1.00,  0.0
];

 var colorsmal = [
        1.0, 0.0, 0.5, 1.0,
        1.0, 0.0, 0.5, 1.0,
        1.0, 0.0, 0.5, 1.0,
        1.0, 0.0, 0.5, 1.0,
        1.0, 0.0, 0.5, 1.0,
        1.0, 0.0, 0.5, 1.0,
        1.0, 0.0, 0.5, 1.0,
        1.0, 0.0, 0.5, 1.0
        ];

var pMatrix = mat4.create();

var mvMatrixStack = [];

//----------------------------------------------------------------------------------
function mvPushMatrix() {
    var copy = mat4.clone(mvMatrix);
    mvMatrixStack.push(copy);
}


//----------------------------------------------------------------------------------
function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
      throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

//set up the matrix 
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    }

//define the rotation degrees
function degToRad(degrees) {
        return degrees * Math.PI / 120;
}

//create canvas in html
function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i=0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

//load the shader from the Document Object Model 
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  // If we don't find an element with the specified id
  // we do an early exit 

  if (!shaderScript) {
    return null;
  }
  // Loop through the children for the found DOM element and
  // build up the shader source code as a string
  
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { 
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }

  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}


//set up the shaders
function setupShaders() {
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  }


//first way to updateBuffer, this effect is to make letter I shake from left to right
 function updateBuffers() {
  
        triangleVerticestop[0] = triangleVerticestop[0] + 0.03*Math.sin(2*Math.PI*((framecount+5)/20.0));
        triangleVerticestop[3] = triangleVerticestop[3] + 0.03*Math.sin(2*Math.PI*((framecount+5)/20.0));
        triangleVerticestop[6] = triangleVerticestop[6] + 0.03*Math.sin(2*Math.PI*((framecount+5)/20));
        triangleVerticestop[9] = triangleVerticestop[9] + 0.03*Math.sin(2*Math.PI*((framecount+5)/20));
        triangleVerticestop[12] = triangleVerticestop[12] -0.03*Math.sin(2*Math.PI*((framecount+5)/20));  //repeat vetex, should be the same pace with the bommon fan
        triangleVerticestop[15] = triangleVerticestop[15] + 0.03*Math.sin(2*Math.PI*((framecount+5)/20));
        triangleVerticestop[18] = triangleVerticestop[18] + 0.03*Math.sin(2*Math.PI*((framecount+5)/20.0));
        triangleVerticestop[21] = triangleVerticestop[21] +0.03*Math.sin(2*Math.PI*((framecount+5)/20.0));

  
   
        triangleVerticesmid[0] = triangleVerticesmid[0] - 0.03*Math.sin(2*Math.PI*((framecount+5)/20.0));
        triangleVerticesmid[3] = triangleVerticesmid[3] - 0.03*Math.sin(2*Math.PI*((framecount+5)/20.0));
        triangleVerticesmid[6] = triangleVerticesmid[6] - 0.03*Math.sin(2*Math.PI*((framecount+5)/20.0));
        triangleVerticesmid[9] = triangleVerticesmid[9] - 0.03*Math.sin(2*Math.PI*((framecount+5)/20.0));
        triangleVerticesmid[15] = triangleVerticesmid[15] - 0.03*Math.sin(2*Math.PI*((framecount+5)/20.0));
        triangleVerticesmid[12] = triangleVerticesmid[12] + 0.03*Math.sin(2*Math.PI*((framecount+5)/20.0)); //repeat vetex, should be the same pace with the top fan
        triangleVerticesmid[18] = triangleVerticesmid[18] - 0.03*Math.sin(2*Math.PI*((framecount+5)/20.0));
        triangleVerticesmid[21] = triangleVerticesmid[21] - 0.03*Math.sin(2*Math.PI*((framecount+5)/20.0));

        //update the top buffer new positions
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffertop);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVerticestop), gl.DYNAMIC_DRAW);
        vertexPositionBuffertop.itemSize = 3;
        vertexPositionBuffertop.numberOfItems = 8;
        //update the bottom buffer new positions
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffermid);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVerticesmid), gl.DYNAMIC_DRAW);
        vertexPositionBuffermid.itemSize = 3;
        vertexPositionBuffermid.numberOfItems = 8;
}

//second way to updateBuffers, this will enlarge the middle of letter "I" from left to right
function updateBuffers1(){

     //everytime i+3 means change the x coordinate for the top butters
    for(var i = 0; i < 15; i=i+3){
     triangleVerticestop[i] = triangleVerticestop[i] - 0.03*Math.sin(2*Math.PI*((framecount)/ 20.0));
    }
    
    
    for(var i = 15; i < triangleVerticestop.length; i=i+3){
     triangleVerticestop[i] = triangleVerticestop[i] + 0.03*Math.sin(2*Math.PI*((framecount)/ 20.0));
    }

    //everytime i+3 means change the x coordinate for the bottom butters
    for(var i = 0; i < 15; i=i+3){
      triangleVerticesmid[i] = triangleVerticesmid[i] + 0.03*Math.sin(2*Math.PI*((framecount)/ 20.0));
     }
        
         
    for(var i = 15; i < triangleVerticestop.length; i=i+3){
     triangleVerticesmid[i] = triangleVerticesmid[i] - 0.03*Math.sin(2*Math.PI*((framecount)/ 20.0));
    }


     //update the top buffers new positions
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffertop);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVerticestop), gl.DYNAMIC_DRAW);
    vertexPositionBuffertop.itemSize = 3;
    vertexPositionBuffertop.numberOfItems = 8;
     //update the bottom buffers new positions
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffermid);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVerticesmid), gl.DYNAMIC_DRAW);
    vertexPositionBuffermid.itemSize = 3;
    vertexPositionBuffermid.numberOfItems = 8;

}

//third way to updatebuffer, this make letter I shake hands.
function updateBuffers2(){

    //change both x and y coordinates of 4 vertex of the top of Letter 'I'
    for (var i = 3;i < 9; i++) {
        triangleVerticestop[i] = triangleVerticestop[i] + 0.03*Math.sin(2*Math.PI*((framecount+5)/20.0));
    };
    for (var i = 18;i < 24; i++) {
        triangleVerticestop[i] = triangleVerticestop[i] + 0.03*Math.sin(2*Math.PI*((framecount+5)/20));
    };
    //change both x and y coordinates of 4 vertex of the bommon of Letter 'I'
    for (var i = 3;i < 9; i++) {
        triangleVerticesmid[i] = triangleVerticesmid[i] + 0.03*Math.sin(2*Math.PI*((framecount+5)/20.0));
    };
    for (var i = 18;i < 24; i++) {
        triangleVerticesmid[i] = triangleVerticesmid[i] + 0.03*Math.sin(2*Math.PI*((framecount+5)/20.0));
    };

    //update the top buffers new positions
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffertop);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVerticestop), gl.DYNAMIC_DRAW);
    vertexPositionBuffertop.itemSize = 3;
    vertexPositionBuffertop.numberOfItems = 8;
    //update the bommon buffers new positions
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffermid);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVerticesmid), gl.DYNAMIC_DRAW);
    vertexPositionBuffermid.itemSize = 3;
    vertexPositionBuffermid.numberOfItems = 8;

}

//fourth way to updateBuffer, this make the letter 'I' enlarge from top to bottom
function updateBuffers3(){
     //everytime i+3 means change the y coordinate for the top butters, here i starts form 1!
    for(var i = 1; i < 16; i=i+3){
      if (i==13) {continue;};
     triangleVerticestop[i] = triangleVerticestop[i] - 0.03*Math.sin(2*Math.PI*((framecount)/ 20.0));
    }
    //the repeat vertex, should be the same pace with the bottom
    triangleVerticestop[13] = triangleVerticestop[13] + 0.03*Math.sin(2*Math.PI*((framecount)/ 20.0));
    
    
    for(var i = 16; i < triangleVerticestop.length; i=i+3){
     triangleVerticestop[i] = triangleVerticestop[i] - 0.03*Math.sin(2*Math.PI*((framecount)/ 20.0));
    }
    
    //everytime i+3 means change the y coordinate for the bommon butters, here i starts form 1!
    for(var i = 1; i < 16; i=i+3){
      if (i==13) {continue};
      triangleVerticesmid[i] = triangleVerticesmid[i] + 0.03*Math.sin(2*Math.PI*((framecount)/ 20.0));
    }

    //the repeat vertex, should be the same pace with the top fan  
    triangleVerticesmid[13] = triangleVerticesmid[13] -0.03*Math.sin(2*Math.PI*((framecount)/ 20.0));    
     
    for(var i = 16; i < triangleVerticestop.length; i=i+3){
       triangleVerticesmid[i] = triangleVerticesmid[i] + 0.03*Math.sin(2*Math.PI*((framecount)/ 20.0));
    }
    //update the top buffers new positions
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffertop);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVerticestop), gl.DYNAMIC_DRAW);
    vertexPositionBuffertop.itemSize = 3;
    vertexPositionBuffertop.numberOfItems = 8;
    //update the bottom buffers new positions 
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffermid);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVerticesmid), gl.DYNAMIC_DRAW);
    vertexPositionBuffermid.itemSize = 3;
    vertexPositionBuffermid.numberOfItems = 8;


}


//update the color buffers
function updatecolor(){
     for(var i = 1; i < 16; i++){
      if(i%3==0) continue;
     colorsmal[i] = colorsmal[i] + 0.03*Math.sin(2*Math.PI*((framecount)/ 120.0));
     }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, smalcortop);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorsmal), gl.DYNAMIC_DRAW);
    smalcortop.itemSize = 3;
    smalcortop.numberOfItems = 8;
    gl.bindBuffer(gl.ARRAY_BUFFER, smalcormid);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorsmal), gl.DYNAMIC_DRAW);
    smalcormid.itemSize = 3;
    smalcormid.numberOfItems = 8;
   

}
//set up the buffers
function setupBuffers() {
  //set up the position buffers of top fan
  vertexPositionBuffertop= gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffertop);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices_inittop), gl.DYNAMIC_DRAW);
  vertexPositionBuffertop.itemSize = 3;
  vertexPositionBuffertop.numberOfItems = 8;
  //set up the position buffers of bottom fan
  vertexPositionBuffermid = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffermid);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices_initmid), gl.DYNAMIC_DRAW);
  vertexPositionBuffermid.itemSize = 3;
  vertexPositionBuffermid.numberOfItems = 8;
  //set up the color buffers of top fan
  vertexColorBuffertop = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffertop);
    var colorstop = [
        1.0, 0.0, 0.5, 1.0,
        0.0, 0.5, 0.0, 1.0,
        1.0, 0.8, 0.5, 1.0,
        1.0, 0.8, 0.5, 1.0,
        1.0, 0.3, 0.5, 1.0,
        1.0, 0.8, 0.5, 1.0,
        1.0, 0.8, 0.5, 1.0,
        0.0, 0.5, 0.0, 1.0
        ];
 
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorstop), gl.DYNAMIC_DRAW);
   vertexColorBuffertop.itemSize = 4;
   vertexColorBuffertop.numItems = 8;
  

  //set up the color buffer of the bottom fan
  vertexColorBuffermid = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffermid);
    var colorsmid = [
        1.0, 0.0, 0.5, 1.0,
        0.0, 0.5, 0.5, 1.0,
        1.0, 0.8, 0.5, 1.0,
        1.0, 0.3, 0.5, 1.0,
        1.0, 0.8, 0.5, 1.0,
        1.0, 0.3, 0.5, 1.0,
        1.0, 0.8, 0.5, 1.0,
        0.0, 0.5, 0.5, 1.0
        ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorsmid), gl.DYNAMIC_DRAW);
  vertexColorBuffermid.itemSize = 4;
  vertexColorBuffermid.numItems = 8; 
  // set up the small one collor
  smalcortop= gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, smalcortop);
   
 
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorsmal), gl.DYNAMIC_DRAW);
   smalcortop.itemSize = 4;
   smalcortop.numItems = 8;
  

  //set up the color buffer of the bottom fan
  smalcormid = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, smalcormid);
   
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorsmal), gl.DYNAMIC_DRAW);
  smalcormid.itemSize = 4;
  smalcormid.numItems = 8; 

 
}

//draw the letter I either using triangle-fan or using line-loop
function draw() { 

  var transformVec= vec3.create();
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 
  
  mvPushMatrix();
  mvPushMatrix();   
  mat4.identity(mvMatrix);
 
  vec3.set(transformVec, 0.50, 0.50,0.50);
  mat4.scale(mvMatrix,mvMatrix,transformVec);

  //when frame count is less than 120,just do normal rotation
  if (framecount< 120 && flag%3==0) {
      mat4.rotateZ(mvMatrix, mvMatrix, degToRad(rotAngle)); 
      mat4.rotateY(mvMatrix, mvMatrix, degToRad(rotAngle)); 
      mat4.rotateX(mvMatrix, mvMatrix, degToRad(rotAngle)); 
  }
  if(framecount<120 && flag%3==1)
  {    mat4.rotateX(mvMatrix, mvMatrix, degToRad(rotAngle));
      mat4.rotateZ(mvMatrix, mvMatrix, degToRad(rotAngle)); 
    }
  if (framecount<120 && flag%3==2) 
  {
      mat4.rotateY(mvMatrix, mvMatrix, degToRad(rotAngle));
      mat4.rotateZ(mvMatrix, mvMatrix, degToRad(rotAngle)); 
  }
  else{
    if (flag%3==1) {
      mat4.rotateZ(mvMatrix, mvMatrix, degToRad(rotAngle));
      }
    if(flag%3==2)
      mat4.rotateY(mvMatrix, mvMatrix, degToRad(rotAngle));
    if (flag%3==0) 
       mat4.rotateX(mvMatrix, mvMatrix, degToRad(rotAngle));
  }
 
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffertop);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffertop.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffertop);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                        vertexColorBuffertop.itemSize, gl.FLOAT, false, 0, 0);
  
  setMatrixUniforms();
  
  //check box for wireframe 
  if(document.getElementById("turnon").checked){
          gl.drawArrays(gl.LINE_LOOP, 0, vertexPositionBuffertop.numberOfItems);
          for (var i = 3; i<8;i++) {
           gl.drawArrays(gl.LINE_LOOP, 0, i);  
          };
  }else
  {
          gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexPositionBuffertop.numberOfItems);
  }
   
 
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffermid);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffermid.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffermid);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                        vertexColorBuffermid.itemSize, gl.FLOAT, false, 0, 0);
  
  setMatrixUniforms();
  if(document.getElementById("turnon").checked){
      gl.drawArrays(gl.LINE_LOOP, 0, vertexPositionBuffermid.numberOfItems); 
      for (var i = 3; i<8;i++) {
           gl.drawArrays(gl.LINE_LOOP, 0, i);  
      };
       
  }else
  {
      gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexPositionBuffermid.numberOfItems);
  }
  mvPopMatrix();

  if(framecount>=300)
  {
  mvPushMatrix();
  mat4.rotateZ(mvMatrix, mvMatrix, degToRad(360*(days/27.0)));  
  vec3.set(transformVec,0.7,0.0,0.0);
  mat4.translate(mvMatrix, mvMatrix,transformVec);
  vec3.set(transformVec,0.2,0.2,0.2);
  mat4.scale(mvMatrix, mvMatrix,transformVec);     
    
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffertop);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffertop.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, smalcortop);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                            smalcortop.itemSize, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexPositionBuffertop.numberOfItems);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffermid);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffermid.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, smalcormid);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                            smalcormid.itemSize, gl.FLOAT, false, 0, 0);
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexPositionBuffermid.numberOfItems);
  mvPopMatrix(); 
  }
  mvPopMatrix();
 

}

//animation function to make letter 'I' move
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;    
        rotAngle= (rotAngle+1.0) % 360;
    }
    var elapsed=timeNow-lastTime;
    lastTime = timeNow;
    
    //when framecount is less than 120, the effect is just rotation
    //when framecount is between 120 to 240, the effect is shaking from left to right
    //when framecount is between 240 to 360, the effect is enlarging from left to right
    //when framecount is between 360 to 480, the effect is shaking hands
    //when framecount is between 480 to 600, the effect is enlargeing from top to bottom
    //then repeat
    days=days+0.01;
    if(framecount>=120 && framecount <240){
        updateBuffers();
    
    } 
    if(framecount>=240 && framecount <360) {
        updateBuffers1();
        updatecolor();

    }
    if(framecount>=360 && framecount <480){
        updateBuffers2();
    }
    if (framecount >=480 && framecount < 600) {
       
        updateBuffers3();
        updatecolor();
     
    }
    
  
    
}
 //startup which allow the html to call
function startup() {
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders(); 
  setupBuffers();
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST); //check the draw is right
 // gl.enable(gl.CULL_FACE); //check the draw is right
  //gl.cullFace(gl.BACK); 
  tick();
}

//decide the time, can call the function draw and animate
function tick() {

  //make framecount always be a number between 0 to 600
  if (framecount<600) 
    framecount++;
  else
    { 
      flag++;
      framecount=framecount%600;
    }

    requestAnimFrame(tick);
    draw();
    animate();
    
    

}



