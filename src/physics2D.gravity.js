/*
	Physics plugin for gravity

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
 */

ParticleJS.Physics2D.Gravity = function(options) {

	options = options || {};

	var g = new Vector();
	g.x = options.x || 0;
	g.y = options.y || 0;

	if (typeof options.angle === "number" && typeof options.force === "number") {
		g.fromAngleMag(options.angle, optons.force);
	}

	this.id = options.id || "";

	this.isDirty = true;
	this.canBlend = false;

	this.init = function(e) {
		if (e.callback) e.callback(true);
	};

	this.apply = function(p) {
		p.v.add(g);
	};

	this.updateFrame = function(e) {
	};

	this.showDebug = function(e) {
	};

	this.gravityFromXY = function(x, y) {

		if (!arguments.length) return g;

		g.x = x;
		g.y = y;

		return this;
	};

	this.gravityFromVector = function(v) {

		if (!arguments.length) return g;

		g.x = v.x;
		g.y = v.y;

		return this;
	};

	this.gravityFromAngleDist = function(angle, dist) {
		if (!arguments.length) return Math.atan2(g.y, g.x);
		g.fromAngleMag(angle, dist);
		return this;
	};

	this.gravityX = function(x) {
		if (!arguments.length) return g.x;
		g.x = x;
		return this;
	};

	this.gravityY = function(y) {
		if (!arguments.length) return g.y;
		g.y = y;
		return this;
	};

	this.scale = function(f) {
		g.scale(f);
		return this;
	};
};
