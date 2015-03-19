/*
	Physics plugin for target

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
 */

ParticleJS.Physics2D.Target = function(options) {

	options = options || {};

	var tx = options.x || 0,
		ty = options.y || 0,
		force = options.force || 0,
		influence = options.lifeInfluence || 0.5;

	this.id = options.id || "";

	this.isDirty = true;
	this.canBlend = false;

	this.init = function(e) {
		if (e.callback) e.callback(true);
	};

	this.apply = function(p) {

		if (force) {

			var a = Math.atan2(ty - p.y, tx - p.x),
				i = 1 - influence * (1 - p.lifeIndex);

			p.v.addXY(
				force * i * Math.cos(a),
				force * i * Math.sin(a)
			);
		}
	};

	this.updateFrame = function(e) {
	};

	this.showDebug = function(e) {
		e.drawObject.rect(tx - 4, ty - 4, 8, 8);
	};

	this.position = function(x, y) {

		if (!arguments.length) return {
			x: tx,
			y: ty
		};

		tx = x;
		ty = y;

		return this;
	};

	this.targetX = function(x) {
		if (!arguments.length) return tx;
		tx = x;
		return this;
	};

	this.targetY = function(y) {
		if (!arguments.length) return ty;
		ty = y;
		return this;
	};

	this.force = function(f) {
		if (!arguments.length) return force;
		force = f;
		return this;
	};

	this.scale = function(f) {
		force *= f;
		tx *= f;
		ty *= f;
		return this;
	};

	this.translate = function(dx, dy) {
		tx += dx;
		ty += dy;
		return this;
	};

};
