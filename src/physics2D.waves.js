/*
	Physics plugin for Waves

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
 */

ParticleJS.Physics2D.Waves = function(options) {

	options = options || {};

	var me = this,
		angle = options.angle || 0,
		force = options.force || 0,
		cellsX = options.cellsX || 32,
		cellsY = options.cellsY || 32,
		freq = options.frequency || 3,
		amp = options.amplitude || 0.5,
		ampVariations = 0,

		isInited = false,

		deg2rad	= 0.017453292519943295,
		angleRad = angle * deg2rad,

		w, h,
		map;

	this.id = options.id || "";

	this.isDirty = true;
	this.canBlend = true;

	this.init = function(e) {

		w = e.width;
		h = e.height;

		map = new ParticleJS.Tools.GridObject(w, h, cellsX, cellsY);

		isInited = true;
		calcWind();

		if (e.callback) e.callback(true);
	};

	this.apply = function(p) {
		if (force) {
			var v = map.getVectorAtPosXY(p.x, p.y);
			p.v.addScale(v, force);
		}
	};

	function calcWind() {

		if (!isInited) return;

		var pi2 = Math.PI * 2,
			mw = map.cellsX - 1,
			preFreq = pi2 * freq;

		map.clear();

		map.forEach(function(x, y) {

			var fx = (x / mw) * preFreq,
				a = Math.sin(fx) * variation(amp, ampVariations) + angleRad;

			map.getVectorAtCellXY(x, y).fromAngleMag(a % pi2, 1);
		});

		me.isDirty = true;

		function variation(v, f) {
			return (1 - f) * v + f * Math.random();
		}
	}

	this.updateFrame = function(e) {
	};

	this.showDebug = function(e) {

		var d = e.drawObject,
			hw = w * 0.5,
			fw = hw * force;

		d.translate(w * 0.5, h * 0.5);
		d.rotate(angleRad);
		d.line(-fw, 0, fw, 0);
		d.rect(fw, -1, 3, 3);
	};

	this.angle = function(a) {

		if (!arguments.length) return angle;

		angle = a;
		angleRad = a * deg2rad;

		calcWind();

		return this;
	};

	this.force = function(f) {
		if (!arguments.length) return force;
		force = f;
		return this;
	};

	this.angleAndForce = function(a, f) {

		if (!arguments.length) return {
			force: force,
			angle: angle
		};

		force = f;
		angle = a;
		angleRad = a * deg2rad;

		calcWind();

		return this;
	};

	this.getMapImage = function(fg, bg) {
		return ParticleJS.Tools.getMapImage(map, fg, bg);
	};

	this.scale = function(f) {

		w *= f;
		h *= f;
		force *= f;

		map.scale(f);

		return this;
	};
};
