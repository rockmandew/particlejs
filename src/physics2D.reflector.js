/*
	Physics plugin for wind

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
 */

ParticleJS.Physics2D.Reflector = function(options) {

	options = options || {};

	var x1 = options.x1,
		y1 = options.y1,
		x2 = options.x2,
		y2 = options.y2,
		radius = options.radius || 2,
		absorption = options.absorption || 0,

		isActive = (typeof options.isActive === 'boolean') ? options.isActive : true,
		callback = options.callback || null,

		isInited = false,

		// normal from reflecting surface
		angle = Math.atan2(y2-y1, x2-x1),
		normal = {
			x: Math.sin(angle),
			y: -Math.cos(angle)
		},

		w, h,
		hitObject;

	this.id = options.id || "";

	this.isDirty = true;
	this.canBlend = false;

	this.init = function(e) {

		w = e.width;
		h = e.height;

		isInited = true;
		calcHitRegion();

		if (e.callback) e.callback(true);
	};

	this.apply = function(p) {

		if (isActive) {

			if (hitObject.test(p.x, p.y)) {
				if (!p.isHit) {

					p.v.reflect(normal);
					p.v.scale((1 - absorption));
					p.isHit = true;

					if (callback) callback({
						x1: x1,
						y1: y1,
						x2: x2,
						y2: y2,
						particle: p
					});
				}
			}
			else
				p.isHit = false;

		}

	};

	function calcHitRegion() {

		if (isInited)
			hitObject = new ParticleJS.Tools.CreateHitMapFromLine(w, h, x1, y1, x2, y2, radius, 1);
	}

	this.updateFrame = function(e) {
	};

	this.showDebug = function(e) {
		e.drawObject.line(x1, y1, x2, y2);
	};

	this.line = function(lx1, ly1, lx2, ly2, r) {

		if (!arguments.length) return {
			x1: x1,
			y1: y1,
			x2: x2,
			y2: y2,
			radius: radius
		};

		x1 = lx1;
		y1 = ly1;
		x2 = lx2;
		y2 = ly2;
		radius = r || radius;

		// update normal vector
		angle = Math.atan2(y2-y1, x2-x1);

		normal = {
			vx: Math.sin(angle),
			vy: -Math.cos(angle)
		};

		calcHitRegion();

		return this;
	};

	this.isActive = function(state) {

		if (!arguments.length) return isActive;

		isActive = state;

		return this;
	};

	this.scale = function(f) {
		radius *= f;
		x1 *= f;
		y1 *= f;
		x2 *= f;
		y2 *= f;
		w *= f;
		h *= f;
		calcHitRegion();
		return this;
	};

	this.translate = function(dx, dy) {
		x1 += dx;
		y1 += dy;
		x2 += dx;
		y2 += dy;
		return this;
	};

};
