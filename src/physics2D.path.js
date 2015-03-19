/*
	Physics plugin for path

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
 */

ParticleJS.Physics2D.Path = function(options) {

	options = options || {};

	var path = options.path,
		tension = (typeof options.tension === "number") ? options.tension : 0.5,
		loop = options.isClosed || false,
		points = curve(path, tension, loop),
		len = points.length * 0.5 - 1,
		force = options.force || 0,
		influence = options.influence || 0;

	this.id = options.id || "";
	this.isDirty = true;
	this.canBlend = false;

	this.init = function(e) {
		if (e.callback) e.callback(true);
	};

	this.apply = function(p) {

		if (influence) {

			var i = (((p.lifeIndex * force * len)|0) % len) << 1,
				tx = points[i],
				ty = points[i+1];

			p.x = p.x * (1 - influence) + influence * tx;
			p.y = p.y * (1 - influence) + influence * ty;
		}
	};

	this.updateFrame = function() {
	};

	this.showDebug = function(e) {
		e.drawObj.moveTo(points[0], points[1]);
		for(var i = 2, l = points.length; i < l; i += 2) {
			e.drawObject.lineTo(points[i], points[i+1])
		}
	};

	this.path = function(newPath, newTension, isClosed) {

		if (!arguments.length) return path;

		path = newPath;
		tension = (typeof newTension === "number") ? newTension : 0.5;
		loop = isClosed || false;

		points = curve(path, tension, loop);

		return this;
	};

	this.getCurvePoints = function() {
		return points;
	};

	this.force = function(f) {
		if (!arguments.length) return force;
		force = f;
		return this;
	};

	this.influence = function(inf) {
		if (!arguments.length) return influence;
		influence = inf;
		return this;
	};

	this.scale = function(f) {
		force *= f;
		for(var i = 0, l = points.length; i < l; i++) points[i] *= f;
		return this;
	};

	this.translate = function(dx, dy) {
		for(var i = 0, l = points.length; i < l; i += 2) {
			points[i] += dx;
			points[i+1] += dy;
		}
		return this;
	};

	function curve(points, tension, close) {

		var numOfSeg = 20,
			pts,
			i = 1,
			l = points.length,
			rPos = 0,
			rLen = (l-2) * numOfSeg + 2 + (close ? 2 * numOfSeg: 0),
			res = new Float32Array(rLen),
			cache = new Float32Array((numOfSeg + 2) * 4),
			cachePtr = 4;

		pts = points.slice(0);

		if (close) {
			pts.unshift(points[l - 1]);
			pts.unshift(points[l - 2]);
			pts.push(points[0], points[1]);
		}
		else {
			pts.unshift(points[1]);
			pts.unshift(points[0]);
			pts.push(points[l - 2], points[l - 1]);
		}

		cache[0] = 1;

		for (; i < numOfSeg; i++) {

			var st = i / numOfSeg,
				st2 = st * st,
				st3 = st2 * st,
				st23 = st3 * 2,
				st32 = st2 * 3;

			cache[cachePtr++] =	st23 - st32 + 1;	// c1
			cache[cachePtr++] =	st32 - st23;		// c2
			cache[cachePtr++] =	st3 - 2 * st2 + st;	// c3
			cache[cachePtr++] =	st3 - st2;			// c4
		}

		cache[++cachePtr] = 1;						// 0,1,0,0

		// calc. points
		parse(pts, cache, l);

		if (close) {
			//l = points.length;
			pts = [];
			pts.push(points[l - 4], points[l - 3], points[l - 2], points[l - 1]); // second last and last
			pts.push(points[0], points[1], points[2], points[3]); // first and second
			parse(pts, cache, 4);
		}

		function parse(pts, cache, l) {

			for (var i = 2, t; i < l; i += 2) {

				var pt1 = pts[i],
					pt2 = pts[i+1],
					pt3 = pts[i+2],
					pt4 = pts[i+3],

					t1x = (pt3 - pts[i-2]) * tension,
					t1y = (pt4 - pts[i-1]) * tension,
					t2x = (pts[i+4] - pt1) * tension,
					t2y = (pts[i+5] - pt2) * tension;

				for (t = 0; t < numOfSeg; t++) {

					var c = t << 2, //t * 4;

						c1 = cache[c],
						c2 = cache[c+1],
						c3 = cache[c+2],
						c4 = cache[c+3];

					res[rPos++] = c1 * pt1 + c2 * pt3 + c3 * t1x + c4 * t2x;
					res[rPos++] = c1 * pt2 + c2 * pt4 + c3 * t1y + c4 * t2y;
				}
			}
		}

		// add last point
		l = close ? 0 : points.length - 2;
		res[rPos++] = points[l];
		res[rPos] = points[l+1];

		return res;
	}

};
