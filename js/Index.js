// Index.js

// Function to shuffle an array
function shuffle(o) { //v1.0
	for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	return o;
};

// Immediately Invoked Function Expression (IIFE)
(function () {
	// Function to generate a random number between min and max
	var random = function (min, max) { return min + Math.random() * (max - min); }

	// Function to get a random element from an array
	var getRandomElement = function (ary) { return ary[Math.floor(Math.random() * ary.length)]; }

	// Main class definition
	Main = function () {
		this._init();
	}

	var p = Main.prototype;

	// Initialization function
	p._init = function () {
		// Create a canvas element and append it to the body
		this._canvas = document.createElement("canvas");
		document.body.appendChild(this._canvas);
		this._canvas.width = window.innerWidth;
		this._canvas.height = window.innerHeight;

		console.log("INIT GL TOOLS");

		// Initialize GL (WebGL context)
		GL.init(this._canvas);

		// Create a new SceneFlowers object
		this.scene = new SceneFlowers();

		var that = this;
		// Start the scene after a delay of 500 milliseconds
		setTimeout(function () {
			that.start();
		}, 500);
	};

	// Start function
	p.start = function () {
		// Add the scene's loop function to the scheduler
		scheduler.addEF(this, this.render, []);
	};

	// Render function
	p.render = function () {
		// Call the scene's loop function
		this.scene.loop();
	};
})();