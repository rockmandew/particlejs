/*
	Nozzle spray physics plugin

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
 */

ParticleJS.Physics2D.Nozzle = function(options) {

	options = options || {};

	var me = this,
		deg2rad = Math.PI / 180,

		cx = options.x || 0,
		cy = options.y || 0,
		radius = options.radius || 100,
		cellsX = options.cellsX || 32,
		cellsY = options.cellsY || 32,
		force = options.force || 0,
		innerForce = options.innerForce || 1,							// radial gradient
		outerForce = options.outerForce || 0.05,
		aVariation = options.angleVariation || 0,						// angle var.
		fVariation = options.forceVariation || 0,						// force var.

		angleOffset = options.spreadOffset || 0,
		angleSpread	= options.spreadAngle || 360,
		angleOffsetRad = angleOffset * deg2rad,
		angleSpreadRad = angleSpread * deg2rad,

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
			aVar = aVariation * pi2,
			fDiff = outerForce - innerForce,
			startAngle = angleOffsetRad,
			endAngle = angleOffsetRad + angleSpreadRad;

		// reset all to 0
		map.clear();

		map.forEach(function(x, y) {

			var v = map.getAngleDist(x, y, cx, cy);

			if (v.dist <= r2 && angleInRange(v.angle, startAngle, endAngle)) {
				map.getVectorAtCellXY(x, y).fromAngleMag(
					v.angle + Math.random() * aVar,
					innerForce + fDiff * (v.dist / r2) * (1 - Math.random() * fVariation)
				);
			}

		});

		me.isDirty = true;

		function angleInRange(angle, start, end) {

			while(angle < 0) angle += pi2;

			start = start % pi2;
			end = end % pi2;

			if (start > end) return((angle > start) || ( angle <= end));
			else if (start < end) return((angle < end) && ( angle >= start));

			return (angle === start);
		}

	}

	this.position = function(x, y) {

		if (!arguments.length) return {
			x: cx,
			y: cy
		};

		cx = x;
		cy = y;

		calcMap();

		return this;
	};

	this.angleAndForce = function(spread, offset, f) {

		if (!arguments.length) return {
			spreadAngle: angleSpread,
			spreadOffset: angleOffset,
			force: force
		};

		angleSpread = spread;
		angleSpreadRad = angleSpread * deg2rad;

		angleOffset = offset;
		angleOffsetRad = angleOffset * deg2rad;

		if (f) force = f;

		calcMap();

	};

	this.spreadAngle = function(angle) {

		if (!arguments.length) return angleSpread;

		angleSpread = angle;
		angleSpreadRad = angleSpread * deg2rad;

		calcMap();

		return this;
	};

	this.offsetAngle = function(angle) {

		if (!arguments.length) return angleOffset;

		angleOffset = angle;
		angleOffsetRad = angleOffset * deg2rad;

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
		//TODO force must recalc grid for blending to work... move force permanently to map
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

	this.settings = function(options) {
		//todo for possible future JSON based scene builder
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

