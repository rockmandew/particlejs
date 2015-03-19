/*
	Scene class for ParticleJS

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
*/

ParticleJS.Scene = function(options) {

	options = options || {};

	var //me				= this,
		width			= options.width || 512,							// width of scene
		height			= options.height || 256,						// height of scene
		//mode			= options.mode ? options.mode : '',
		//mode3D			= mode.toUpperCase() === '3D',					// mode: 0 = 2D, 1 = 3D
		frameBound		= !!options.frameBound,							// frame or time bound, def. time
		FPS				= options.FPS || 60,

		//lights			= [],
		//cameras			= [],

		lastTime		= performance.now()
	;

	this.emitters		= [];

	/*
	this.addCamera = function(options) {

		if (!mode3D)
			throw "Need to be in 3D mode to add a camera.";

	};

	this.addLight = function(options) {

		if (!mode3D)
			throw "Need to be in 3D mode to add a light.";

	};
	*/

	this.addEmitter = function(emitter) {

		emitter.init({
			width: width,
			height: height
		});

		this.emitters.push(emitter);

		return this;
	};

	this.pause = function() {
		for(var i = 0, emitter; emitter = this.emitters[i]; i++) emitter.pause();
		return this;
	};

	this.play = function() {
		for(var i = 0, emitter; emitter = this.emitters[i]; i++) emitter.play();
		return this;
	};

	this.stop = function() {
		for(var i = 0, emitter; emitter = this.emitters[i]; i++) emitter.stop();
		return this;
	};

	//TODO: disabled for now
	this.preRoll = function(frames) {
		//TODO use physics directly and as frame bound (ts=1), lifeUpdate changes..
		var time = performance.now();
		for(var pre = 0; pre < frames; pre++) {
			for(var i = 0, e; e = this.emitters[i]; i++) {
				//e.renderParticles(1, 16.667, time, true);
			}
		}
		return this;
	};

	this.render = function() {

		var time = performance.now(),
			frameTime = 1000 / 60,
			diff = time - lastTime,
			ts = frameBound ? 60 / FPS : diff / frameTime;

		lastTime = time;

		for(var i = 0, emitter; emitter = this.emitters[i]; i++) {

			if (!emitter.isPaused()) {

				var num = emitter.birthRate() * ts / FPS;

				if (num) {
					num += emitter.remainder;
					emitter.remainder = (num - (num|0));
					num = num|0;
					if (num) emitter.generateParticles(time, num);
				}

				emitter.renderParticles(time, ts);
				emitter.cleanupParticles(time);
			}
		}

		return this;
	};

	this.renderNoGeneration = function() {

		var time = performance.now(),
			frameTime = 1000 / 60,
			diff = time - lastTime,
			ts = frameBound ? 60 / FPS : diff / frameTime;

		lastTime = time;

		for(var i = 0, emitter; emitter = this.emitters[i++];) {
			emitter.renderParticles(time, ts);
			emitter.cleanupParticles(time);
		}

		return this;
	};

};