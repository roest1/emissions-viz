// GLTools.js
import { mat4 } from 'gl-matrix';

export const GL = {
    id: "GLTools",
    aspectRatio: window.innerWidth / window.innerHeight,
    fieldOfView: 45,
    zNear: 5,
    zFar: 3000,

    init(canvas) {
        this.canvas = canvas;
        this.gl = this.canvas.getContext("webgl", {antialias:true}) || this.canvas.getContext("experimental-webgl", {antialias:true}) ;
        this._enabledVertexAttrib = []
        
        // Create projection matrix early
        this.projection = mat4.create();

        this.resize();

        var size = this.gl.getParameter(this.gl.SAMPLES);
        var antialias = this.gl.getContextAttributes().antialias;

        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.enable(this.gl.BLEND);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clearDepth(1);
        // Try different extension names for depth texture
    this.depthTextureExt = this.gl.getExtension("WEBKIT_WEBGL_depth_texture") || 
                          this.gl.getExtension("WEBGL_depth_texture") ||
                          this.gl.getExtension("MOZ_WEBGL_depth_texture");
                          
    // Try different extension names for float texture
    this.floatTextureExt = this.gl.getExtension("OES_texture_float") ||
                          this.gl.getExtension("WEBKIT_OES_texture_float") ||
                          this.gl.getExtension("MOZ_OES_texture_float");


        console.log("Extensions: ", this.depthTextureExt, this.floatTextureExt);

        this.matrix = mat4.create();
        mat4.identity(this.matrix);
        this.enableAlphaBlending();
        
        // Fix this binding in resize event listener
        window.addEventListener("resize", () => {
            this.resize();
        });
    },

    setViewPort(x, y, w, h) {
        this.gl.viewport(x, y, w, h);
    },

    setMatrices(camera) {
        this.camera = camera;
    },

    rotate(rotation) {
        mat4.set(rotation, this.matrix);
    },

    clear(r, g, b, a) {
        this.gl.clearColor(r, g, b, a);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    },

    render() {
        if(!this.shaderProgram) return;
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    },

    enableAlphaBlending() {
	    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);	
    },

    enableAdditiveBlending() {
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE);
    },

    draw(mesh) {
        this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.camera.getMatrix() );
        this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.matrix );

        // 	VERTEX POSITIONS
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.vBufferPos);
        var vertexPositionAttribute = getAttribLoc(this.gl, this.shaderProgram, "aVertexPosition");
        this.gl.vertexAttribPointer(vertexPositionAttribute, mesh.vBufferPos.itemSize, this.gl.FLOAT, false, 0, 0);
        if(this._enabledVertexAttrib.indexOf(vertexPositionAttribute) == -1) {
            this.gl.enableVertexAttribArray(vertexPositionAttribute);
            this._enabledVertexAttrib.push(vertexPositionAttribute);
        }
        
        

        //	TEXTURE COORDS
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.vBufferUV);
        var textureCoordAttribute = getAttribLoc(this.gl, this.shaderProgram, "aTextureCoord");
        this.gl.vertexAttribPointer(textureCoordAttribute, mesh.vBufferUV.itemSize, this.gl.FLOAT, false, 0, 0);
        // this.gl.enableVertexAttribArray(textureCoordAttribute);
        if(this._enabledVertexAttrib.indexOf(textureCoordAttribute) == -1) {
            this.gl.enableVertexAttribArray(textureCoordAttribute);
            this._enabledVertexAttrib.push(textureCoordAttribute);
        }

        //	INDICES
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.iBuffer);

        //	EXTRA ATTRIBUTES
        for(var i=0; i<mesh.extraAttributes.length; i++) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.extraAttributes[i].buffer);
            var attrPosition = getAttribLoc(this.gl, this.shaderProgram, mesh.extraAttributes[i].name);
            this.gl.vertexAttribPointer(attrPosition, mesh.extraAttributes[i].itemSize, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(attrPosition);		

            if(this._enabledVertexAttrib.indexOf(attrPosition) == -1) {
                this.gl.enableVertexAttribArray(attrPosition);
                this._enabledVertexAttrib.push(attrPosition);
            }
        }

        //	DRAWING
        // this.gl.drawElements(mesh.drawType, mesh.iBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);	
        if(mesh.drawType == this.gl.POINTS ) {
            this.gl.drawArrays(mesh.drawType, 0, mesh.vertexSize);	
        } else this.gl.drawElements(mesh.drawType, mesh.iBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);	


        function getAttribLoc(gl, shaderProgram, name) {
            if(shaderProgram.cacheAttribLoc  == undefined) shaderProgram.cacheAttribLoc = {};
            if(shaderProgram.cacheAttribLoc[name] == undefined) {
                shaderProgram.cacheAttribLoc[name] = gl.getAttribLocation(shaderProgram, name);
            }

            return shaderProgram.cacheAttribLoc[name];
        }
    },

    resize(e) {
        this.W = window.innerWidth;
        this.H = window.innerHeight;

        this.canvas.width = this.W;
        this.canvas.height = this.H;
        this.gl.viewportWidth = this.W;
        this.gl.viewportHeight = this.H;
        this.gl.viewport(0, 0, this.W, this.H);
        this.aspectRatio = window.innerWidth/window.innerHeight;

        // Fix perspective call
        mat4.perspective(
            this.projection,  // out matrix
            this.fieldOfView * (Math.PI / 180),  // fovy in radians
            this.aspectRatio,
            this.zNear,
            this.zFar
        );

        this.render();
    }
};

// GL = {};
// GL.id = "GLTools";
// GL.aspectRatio = window.innerWidth/window.innerHeight;
// GL.fieldOfView = 45;
// GL.zNear = 5;
// GL.zFar = 3000;

// GL.init = function(canvas) {
// 	this.canvas = canvas;
// 	this.gl = this.canvas.getContext("webgl", {antialias:true}) || this.canvas.getContext("experimental-webgl", {antialias:true}) ;
// 	this.resize();
// 	this._enabledVertexAttrib = []

// 	var size = this.gl.getParameter(this.gl.SAMPLES);
// 	var antialias = this.gl.getContextAttributes().antialias;
// 	// console.log( "Sample size : ", size, antialias );

// 	this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
//     this.gl.enable(this.gl.DEPTH_TEST);
//     this.gl.enable(this.gl.CULL_FACE)
// 	this.gl.enable(this.gl.BLEND);
// 	this.gl.clearColor( 0, 0, 0, 1 );
// 	this.gl.clearDepth( 1 );
// 	this.depthTextureExt 	= this.gl.getExtension("WEBKIT_WEBGL_depth_texture"); // Or browser-appropriate prefix
// 	this.floatTextureExt 	= this.gl.getExtension("OES_texture_float") // Or browser-appropriate prefix
	

// 	console.log( "Extentions : ", this.depthTextureExt, this.floatTextureExt );

// 	this.matrix 		= mat4.create();
// 	mat4.identity(this.matrix);
// 	this.enableAlphaBlending();
	

// 	var that = GL;
// 	window.addEventListener("resize", function() {
// 		GL.resize();
// 	});
// } 



// GL.setViewport = function(x, y, w, h) {
// 	this.gl.viewport(x, y, w, h);
// }

// GL.setMatrices = function(camera) {
// 	this.camera = camera;
// }

// GL.rotate = function(rotation) {
// 	mat4.set(rotation, this.matrix);
// }

// GL.clear = function(r, g, b, a) {
// 	this.gl.clearColor( r, g, b, a );
// 	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
// }


// GL.render = function() {
// 	if(!this.shaderProgram) return;
// 	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
// 	this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
// }


// GL.enableAlphaBlending = function() {
// 	this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);	
// }


// GL.enableAdditiveBlending = function() {
// 	this.gl.blendFunc(this.gl.ONE, this.gl.ONE);
// }


// GL.draw = function(mesh) {
// 	this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.camera.getMatrix() );
// 	this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.matrix );

// 	// 	VERTEX POSITIONS
// 	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.vBufferPos);
// 	var vertexPositionAttribute = getAttribLoc(this.gl, this.shaderProgram, "aVertexPosition");
// 	this.gl.vertexAttribPointer(vertexPositionAttribute, mesh.vBufferPos.itemSize, this.gl.FLOAT, false, 0, 0);
// 	if(this._enabledVertexAttrib.indexOf(vertexPositionAttribute) == -1) {
// 		this.gl.enableVertexAttribArray(vertexPositionAttribute);
// 		this._enabledVertexAttrib.push(vertexPositionAttribute);
// 	}
	
	

// 	//	TEXTURE COORDS
// 	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.vBufferUV);
// 	var textureCoordAttribute = getAttribLoc(this.gl, this.shaderProgram, "aTextureCoord");
// 	this.gl.vertexAttribPointer(textureCoordAttribute, mesh.vBufferUV.itemSize, this.gl.FLOAT, false, 0, 0);
// 	// this.gl.enableVertexAttribArray(textureCoordAttribute);
// 	if(this._enabledVertexAttrib.indexOf(textureCoordAttribute) == -1) {
// 		this.gl.enableVertexAttribArray(textureCoordAttribute);
// 		this._enabledVertexAttrib.push(textureCoordAttribute);
// 	}

// 	//	INDICES
// 	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.iBuffer);

// 	//	EXTRA ATTRIBUTES
// 	for(var i=0; i<mesh.extraAttributes.length; i++) {
// 		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.extraAttributes[i].buffer);
// 		var attrPosition = getAttribLoc(this.gl, this.shaderProgram, mesh.extraAttributes[i].name);
// 		this.gl.vertexAttribPointer(attrPosition, mesh.extraAttributes[i].itemSize, this.gl.FLOAT, false, 0, 0);
// 		this.gl.enableVertexAttribArray(attrPosition);		

// 		if(this._enabledVertexAttrib.indexOf(attrPosition) == -1) {
// 			this.gl.enableVertexAttribArray(attrPosition);
// 			this._enabledVertexAttrib.push(attrPosition);
// 		}
// 	}

// 	//	DRAWING
// 	// this.gl.drawElements(mesh.drawType, mesh.iBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);	
// 	if(mesh.drawType == this.gl.POINTS ) {
// 		this.gl.drawArrays(mesh.drawType, 0, mesh.vertexSize);	
// 	} else this.gl.drawElements(mesh.drawType, mesh.iBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);	


// 	function getAttribLoc(gl, shaderProgram, name) {
// 		if(shaderProgram.cacheAttribLoc  == undefined) shaderProgram.cacheAttribLoc = {};
// 		if(shaderProgram.cacheAttribLoc[name] == undefined) {
// 			shaderProgram.cacheAttribLoc[name] = gl.getAttribLocation(shaderProgram, name);
// 		}

// 		return shaderProgram.cacheAttribLoc[name];
// 	}
// }


// GL.resize = function(e) {
// 	this.W 	= window.innerWidth;
// 	this.H  = window.innerHeight;

// 	this.canvas.width = this.W;
// 	this.canvas.height = this.H;
// 	this.gl.viewportWidth = this.W;
// 	this.gl.viewportHeight = this.H;
// 	this.gl.viewport(0, 0, this.W, this.H);
// 	this.aspectRatio = window.innerWidth/window.innerHeight;

// 	this.projection 	= mat4.perspective(this.fieldOfView, this.aspectRatio, this.zNear, this.zFar);

// 	this.render();
// }
