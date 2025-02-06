// Framebuffer.js
import { GL } from "./GLTools";
import { GLTexture } from "./GLTexture";

export class Framebuffer {
    constructor(width, height, magFilter, minFilter) {
        if(!GL) return;

		this.gl          = GL.gl;
		this.width  = width;
		this.height = height;
		this.magFilter = magFilter==undefined ? gl.LINEAR : magFilter;
		this.minFilter = minFilter==undefined ? gl.LINEAR : minFilter;

		this._init();
    }

    _init() {
        this.depthTextureExt 	= this.gl.getExtension("WEBKIT_WEBGL_depth_texture"); // Or browser-appropriate prefix

		this.texture            = this.gl.createTexture();
		this.depthTexture       = this.gl.createTexture();
		this.glTexture			= new GLTexture(this.texture, true); // gl/GLTexture.js
		this.glDepthTexture		= new GLTexture(this.depthTexture, true);
		this.frameBuffer        = this.gl.createFramebuffer();		
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
		this.frameBuffer.width  = this.width;
		this.frameBuffer.height = this.height;
		var size                = this.width;

		this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
	    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.magFilter);
	    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.minFilter);
	    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
		if(this.magFilter == this.gl.NEAREST && this.minFilter == this.gl.NEAREST) 
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.frameBuffer.width, this.frameBuffer.height, 0, this.gl.RGBA, this.gl.FLOAT, null);
		else
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.frameBuffer.width, this.frameBuffer.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);

		this.gl.generateMipmap(this.gl.TEXTURE_2D);

		this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthTexture);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
		if(this.depthTextureExt != null) this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.DEPTH_COMPONENT, this.width, this.height, 0, this.gl.DEPTH_COMPONENT, this.gl.UNSIGNED_SHORT, null);

	    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texture, 0);
	    if(this.depthTextureExt == null) {
	    	console.log( "no depth texture" );
	    	var renderbuffer = this.gl.createRenderbuffer();
	    	this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, renderbuffer);
	    	this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.frameBuffer.width, this.frameBuffer.height);
	    	this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, renderbuffer);
	    } else {
	    	this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, this.depthTexture, 0);
	    }
	    
	    

	    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
	    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
	    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    bind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
    }

    unbind() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    getTexture() {
        return this.glTexture;
    }

    getDepthTexture() {
        return this.glDepthTexture;
    }

}


// (function() {
// 	var gl;

// 	Framebuffer = function(width, height, magFilter, minFilter) {
// 		if(!GL) return;

// 		gl          = GL.gl;
// 		this.width  = width;
// 		this.height = height;
// 		this.magFilter = magFilter==undefined ? gl.LINEAR : magFilter;
// 		this.minFilter = minFilter==undefined ? gl.LINEAR : minFilter;

// 		this._init();
// 	}

// 	var p = Framebuffer.prototype;


// 	p._init = function() {
// 		this.depthTextureExt 	= gl.getExtension("WEBKIT_WEBGL_depth_texture"); // Or browser-appropriate prefix

// 		this.texture            = gl.createTexture();
// 		this.depthTexture       = gl.createTexture();
// 		this.glTexture			= new GLTexture(this.texture, true); // gl/GLTexture.js
// 		this.glDepthTexture		= new GLTexture(this.depthTexture, true);
// 		this.frameBuffer        = GL.gl.createFramebuffer();		
// 		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
// 		this.frameBuffer.width  = this.width;
// 		this.frameBuffer.height = this.height;
// 		var size                = this.width;

// 		gl.bindTexture(gl.TEXTURE_2D, this.texture);
// 	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.magFilter);
// 	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.minFilter);
// 	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
// 		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
// 		if(this.magFilter == gl.NEAREST && this.minFilter == gl.NEAREST) 
// 			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.frameBuffer.width, this.frameBuffer.height, 0, gl.RGBA, gl.FLOAT, null);
// 		else
// 			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.frameBuffer.width, this.frameBuffer.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

// 		gl.generateMipmap(gl.TEXTURE_2D);

// 		gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
// 		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
// 		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
// 		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
// 		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
// 		if(this.depthTextureExt != null)gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, this.width, this.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

// 	    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
// 	    if(this.depthTextureExt == null) {
// 	    	console.log( "no depth texture" );
// 	    	var renderbuffer = gl.createRenderbuffer();
// 	    	gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
// 	    	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.frameBuffer.width, this.frameBuffer.height);
// 	    	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
// 	    } else {
// 	    	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0);
// 	    }
	    
	    

// 	    gl.bindTexture(gl.TEXTURE_2D, null);
// 	    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
// 	    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
// 	};


// 	p.bind = function() {
// 		gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
// 	};


// 	p.unbind = function() {
// 		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
// 	};


// 	p.getTexture = function() {
// 		return this.glTexture;
// 	};


// 	p.getDepthTexture = function() {
// 		return this.glDepthTexture;
// 	};
// })();