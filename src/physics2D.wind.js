/*
	Physics plugin for wind (simple version)

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
 */

ParticleJS.Physics2D.Wind = function(options) {

	options = options || {};

	var angle = options.angle || 0,
		force = options.force || 0,

		deg2rad	= 0.017453292519943295,
		angleRad = angle * deg2rad,

		vWind = new Vector(angleRad, force);

	this.id = options.id || "";

	this.isDirty = true;
	this.canBlend = false;

	this.init = function(e) {
		if (e.callback) e.callback(true);
	};

	this.apply = function(p) {
		if (force) p.v.add(vWind);
	};

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

		vWind = new Vector(angleRad, force);

		return this;
	};

	this.angleRad = function(a) {

		if (!arguments.length) return angleRad;

		angle = a * 180 / Math.PI;
		angleRad = a;

		vWind = new Vector(a, force);

		return this;
	};

	this.force = function(f) {
		if (!arguments.length) return force;
		force = f;
		vWind = new Vector(angleRad, force);
		return this;
	};

	this.angleAndForce = function(a, f) {
		if (!arguments.length) return vWind;
		force = f;
		this.angle(a);
		return this;
	};

	this.scale = function(f) {
		force *= f;
		vWind.scale(f);
		return this;
	}
};
