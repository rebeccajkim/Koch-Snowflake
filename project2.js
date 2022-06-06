"use strict";

var gl;
var positions =[];

var numTimes = 0; 

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available" );

    //
    //  Initialize our data for the Koch Snowflake
    //

    snowflake(numTimes);

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    render();

    document.getElementById("slider").onchange = function(event) {
        var slide = document.getElementById('slider').value;
        var val=document.getElementById('demo');
        snowflake(slide);
        render();
        val.innerHTML=slide;
    };

};

function snowflake(numTimes) {
    positions=[];
    var vertices = [ 
        vec2(0, 1),
        vec2(0.5, 0),
        vec2(-0.5, 0)
    ];
    var points=[];
    points.push(vertices[0]); 
    points.push(vertices[1]);
    points.push(vertices[2]);
    points.push(vertices[0]);
    for(var i=0; i<numTimes; ++i) {
        var check=false;
        while(points[0]!=vertices[0] || check==false) {
            check=true;
            var one=points.shift();
            if(points[0]==vertices[0]) {
                var five = points.shift();
            } 
            else {
                var five=points[0];
            }
            var two=mix(one,five,1/3);
            var four=mix(one,five,2/3);
            var rot=mat2(1/2, -1*(Math.sqrt(3)/2), Math.sqrt(3)/2, 1/2);
            var sub=subtract(four,two);
            var multi=mult(rot,sub);
            var three=add(two,multi);
            points.push(one);
            points.push(two);
            points.push(three);
            points.push(four);
            points.push(five);
        }
    }
    while(points.length!=0) {
        positions.push(points.shift());
    }
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT );

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    gl.drawArrays(gl.LINE_STRIP, 0, positions.length);
}
