// ProjectionPerspectiveMatrix.js

if (window.fbo === undefined) window.fbo = {};

(function () {
	if (fbo.ProjectionPerspectiveMatrix === undefined) {
		var ProjectionPerspectiveMatrix = function ProjectionPerspectiveMatrix() {
			this.matrix = mat4.create();
			mat4.identity(this.matrix);
		}

		fbo.ProjectionPerspectiveMatrix = ProjectionPerspectiveMatrix;
		var p = ProjectionPerspectiveMatrix.prototype;


		p.perspective = function (fov, aspect, near, far) {
			this.matrix = mat4.perspective(fov, aspect, near, far);
		}
	}

})();