/*
	Physics plugin for vortex

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
 */

ParticleJS.Physics2D.Vortex = function(options) {

	options = options || {};

	var	me = this,
	   	cx = options.x || 0,
		cy = options.y || 0,
		radius = options.radius || 100,
		cellsX = options.cellsX || 32,
		cellsY = options.cellsY || 32,
		force = options.force || 0,
		suction	= options.suction || 0,											// suction towards center, 0=none, 1 = 90deg, -1 = -90deg
		direction = (options.direction && options.direction === 'cw') ? -1 : 1,	// direction
		innerForce = options.innerForce || 1,									// radial gradient
		outerForce = options.outerForce || 0.05,
		aVariation = options.angleVariation || 0,								// angle var.
		fVariation = options.forceVariation || 0,								// force var.

		isInited = false,
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

		calcMap();

		if (e.callback) e.callback(true);
	};

	this.apply = function(p) {

		if (isInited && force && radius) {
			var v = map.getVectorAtPosXY(p.x, p.y);
			p.v.addScale(v, force);
		}
	};

	this.updateFrame = function(e) {
	};

	this.showDebug = function(e) {

		var d = e.drawObject;

		d.circle(cx, cy, radius);
	};

	function calcMap() {

		if (!isInited) return;

		var	r2 = radius * radius,
		    pi2 = Math.PI * 2,
		    tangent = 0.25 * direction * pi2,
		    suck = tangent * suction;

		// reset all to 0
		map.clear();

		map.forEach(function(x, y) {

			var v = map.getAngleDist(x, y, cx, cy);

			if (v.dist <= r2) {
				map.getVectorAtCellXY(x, y).fromAngleMag(
					v.angle + tangent + suck + Math.random() * aVariation * pi2,
					innerForce + (outerForce - innerForce) * (v.dist / r2) * (1 - Math.random() * fVariation)
				);
			}

		});

		me.isDirty = true;
	}

	this.direction = function(d) {

		if (!arguments.length) return direction < 0 ? 'cw' : 'ccw';

		var tmpDirection = d === 'cw' ? -1 : 1;
		if (tmpDirection === direction) return this;	// skip recalc

		direction = tmpDirection;
		calcMap();
		return this;
	};

	this.radius = function(r) {
		if (!arguments.length) return radius;
		radius = r;
		calcMap();
		return this;
	};

	this.force = function(f) {
		if (!arguments.length) return force;
		force = f;
		return this;
	};

	this.forceGradient = function(fo, fi) {

		//todo untested

		if (!arguments.length) return {
			outer: outerForce,
			inner: innerForce
		};

		if (typeof fo === 'object') {
			outerForce = fo.outer;
			innerForce = fo.inner;
		}
		else {
			outerForce = fo;
			innerForce = fi;
		}

		calcMap();

		return this;
	};

	this.suction = function(s) {
		if (!arguments.length) return suction;

		suction = s;
		calcMap();

		return this;
	};

	this.settings = function(options) {

		//todo untested

		if (!arguments.length) return {
			x: cx,
			y: cy,
			radius: radius,
			cellsX: cellsX,
			cellsY: cellsY,
			force: force,
			innerForce: innerForce,
			outerForce: outerForce,
			suction: suction
		};

		cx = options.x||cy;
		cy = options.y||cx;
		radius = (typeof options.radius === 'number') ? options.radius : radius;
		cellsX = options.cellsX||cellsX;
		cellsY = options.cellsY||cellsY;
		force = (typeof options.force === 'number') ? options.force : force;
		suction = (typeof options.suction === 'number') ? options.suction : suction;
		outerForce = (typeof options.outerForce === 'number') ? options.outerForce : outerForce;
		innerForce = (typeof options.innerForce === 'number') ? options.innerForce : innerForce;

		calcMap();

		return this;
	};

	this.generate = function() {
		calcMap();
		return this;
	};

	this.getMapImage = function(fg, bg) {
		return ParticleJS.Tools.getMapImage(map, fg, bg);
	};

	this.scale = function(f) {

		w *= f;
		h *= f;
		cx *= f;
		cy *= f;
		radius *= f;
		force *= f;

		map.scale(f);

		return this;
	};

	this.translate = function(dx, dy) {
		cx += dx;
		cy += dy;
		return this;
	};

};

