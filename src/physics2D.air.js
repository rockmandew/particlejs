/*
	Physics plugin for Air resistance

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
 */

ParticleJS.Physics2D.Air = function(options) {

	options = options || {};

	var	airRestO = options.airResistance || 0,
		airRest = 1 - airRestO;

	this.id = options.id || "";

	this.isDirty = true;
	this.canBlend = false;

	this.init = function(e) {
		if (e.callback) e.callback(true);
	};

	this.apply = function(p) {
		p.v.scale(airRest);
	};

	this.updateFrame = function(e) {
	};

	this.showDebug = function(e) {
	};

	this.airResistance = function(ar) {
		if (!arguments.length) return airRestO;

		airRestO = ar;
		airRest = (1 - airRestO);

		return this;
	};

	this.scale = function(f) {
		airRestO *= f;
		airRest = (1 - airRestO);
		return this;
	};

};
