/*
	Physics plugin for turbulence

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
 */

ParticleJS.Physics2D.Turbulence = function(options) {

	options = options || {};

	var	me = this,
		cellsX = options.cellsX || 32,
		cellsY = options.cellsY || 32,
		force = options.force || 0,
		slices = options.zSlices || 20,					// z-depth for animated variations
		sliceFrames = options.slicesFrames || 5,
		jitterInt = options.jitterInterval || 10,		// indexes to interpolate over
		jitterCount = options.jitterKeys || 50,			// number of jitter keys
		aOctaves = options.angleOctaves || 2,
		fOctaves = options.forceOctaves || 4,
		dVariation = options.directionVariation || 0.1,	// offset direction variation
		fVariation = options.forceVariation || 0.8,		// force variation

		isInited = false,

		w, h,

		slice = 0,
		sliceCurrentFrame = 0,
		jitter,						// jitter array

		maps = new Array(slices),
		currentMap;

	this.id = options.id || "";

	this.isDirty = true;
	this.canBlend = true;

	this.init = function(e) {

		w = e.width;
		h = e.height;

		isInited = true;

		calcCube();

		if (e.callback) e.callback(true);
	};

	this.apply = function(p) {

		if (force) {
			var v = currentMap.getVectorAtPosXY(p.x, p.y);
			p.v.addScale(v, force);
		}
	};

	this.updateFrame = function(e) {

		if (isInited && force && e.count) {

			sliceCurrentFrame++;

			if (sliceCurrentFrame === sliceFrames) {
				sliceCurrentFrame = 0;

				slice++;

				if (slice === jitter.length) {
					slice = 0;
					calcJitterArray();
				}

				currentMap = maps[jitter[slice]];
			}
		}

	};

	this.showDebug = function(e) {

	};

	// Generates one map for direction and one for force, which are used in combination
	function calcCube() {

		if (!isInited) return;

		var	z = 0,
			pi = Math.PI * 2,
			ro = pi * Math.random() - Math.PI,	// random offset for all
			mx = cellsX,						// max x/y incl. extension
			my = cellsY,
			tAngle = new ParticleJS.Physics2D.Turbulence.SimplexNoise(),
			tForce = new ParticleJS.Physics2D.Turbulence.SimplexNoise();

		// generate 3D slices/cube
		for(; z < slices; z++) {

			// new slice for z
			var map = new ParticleJS.Tools.GridObject(w, h, cellsX, cellsY),
				depthA = (z / slices) * aOctaves,
				depthF = (z / slices) * fOctaves;

			map.clear();

			map.forEach(function(x, y) {

				// args: x, y, z, returns [0.0, 1.0]
				var a = tAngle.noise3D((x / mx) * aOctaves, (y / my) * aOctaves, depthA),
					f = tForce.noise3D((x / mx) * fOctaves, (y / my) * fOctaves, depthF);

				map.getVectorAtCellXY(x, y).fromAngleMag(
					a * pi + ro + pi * dVariation * Math.random(),
					minMax(1 - (f * fVariation))
				);

			});

			maps[z] = map;
		}

		slice = 0;
		currentMap = maps[0];

		calcJitterArray();

		me.isDirty = true;

		function minMax(v) {
			return Math.max(0, Math.min(1, v));
		}
	}

	function calcJitterArray() {

		var total = (jitterCount + 1) * jitterInt - 1,
			cnt = jitterCount * jitterInt,
			jFrom = -1,
			jTo = 0,
			i = 0;

		jitter = new Uint8Array(total);

		// interpolate
		for(; i < cnt; i++) {
			if (i % jitterInt === 0) {
				if (jFrom < 0) {
					jFrom = (Math.random() * slices)|0;
					jTo = (Math.random() * slices)|0;
				}
				else {
					jFrom = jTo;
					jTo = (Math.random() * slices)|0;
				}
			}
			jitter[i] = ip(jFrom, jTo, (i % jitterInt) / jitterInt);
		}

		// make last part fadeIn-able
		jFrom = jTo;
		jTo = jitter[0];

		for(; i < total; i++)
			jitter[i] = ip(jFrom, jTo, (i % jitterInt) / jitterInt);

		function ip(a, b, t) {
			return a + (b - a) * t;
		}
	}

	this.force = function(f) {

		if (!arguments.length) return force;

		force = f;
		return this;
	};

	this.forceVariation = function(fv) {

		if (!arguments.length) return fVariation;

		fVariation = fv;
		calcCube();

		return this;
	};

	this.offsetVariation = function(ov) {

		if (!arguments.length) return dVariation;

		dVariation = ov;
		calcCube();

		return this;
	};

	this.jitterInterval = function(ji) {

		if (!arguments.length) return jitterInt;

		jitterInt = ji;
		return this;
	};

	this.sliceFrames = function(fd) {

		if (!arguments.length) return sliceFrames;

		sliceFrames = fd;
		return this;
	};

	this.octavesAngleMap = function(o) {

		if (!arguments.length) return aOctaves;

		aOctaves = o|1;
		calcCube();

		return this;
	};

	this.octavesForceMap = function(o) {

		if (!arguments.length) return fOctaves;

		fOctaves = o|1;
		calcCube();

		return this;
	};


	this.generate = function() {
		calcCube();
		return this;
	};

	this.getMapImage = function(fg, bg) {
		return ParticleJS.Tools.getMapImage(currentMap, fg, bg);
	};

	this.scale = function(f) {
		w *= f;
		h *= f;
		force *= f;

		for(var i = 0, map; map = maps[i]; i++) {
			map.scale(f);
		}

		return this;
	};
};

/*!
	SimplexNoise based on Stefan Gustavson's public domain Java
	implementation, ported to JavaScript by wwwtyro.

	Modified and optimized by Ken "Epistemex" Fyrstenberg, 2014.
	For details refer to original paper.

    See project at: https://github.com/epistemex/simplex-noise-js

	PUBLIC DOMAIN
 */
ParticleJS.Physics2D.Turbulence.SimplexNoise = function() {

	this.perm = new Uint8Array(512);
	this.perm12 = new Uint8Array(512);

	// every triple padded to 4 so we can use shift op.
	this.grad = new Int8Array([1,1,0,0, -1,1,0,0, 1,-1,0,0, -1,-1,0,0, 1,0,1,0, -1,0,1,0, 1,0,-1,0, -1,0,-1,0, 0,1,1,0, 0,-1,1,0, 0,1,-1,0, 0,-1,-1,0]);

	// permutations x2
	for (var i = 0; i < 256; i++) {
		this.perm[i] = this.perm[i + 256] = Math.random()*256;
		this.perm12[i] = this.perm12[i + 256] = this.perm[i] % 12 << 2;
	}

};

/**
 * Get a noise value for this position in 3D space. Use normalized
 * values - you can scale the values to get more details. Use z=0 to
 * get a 2D value.
 *
 * NOTE: This implementation will return a value between
 * 0 and 1 and NOT -1 to 1.
 *
 * @param {number} x - x
 * @param {number} y - y
 * @param {number} z - z
 * @returns {number} normalized value [0, 1]
 */
ParticleJS.Physics2D.Turbulence.SimplexNoise.prototype.noise3D = function(x, y, z) {

	var s = (x + y + z) * 0.33333333333,

		i = (x + s)|0,
		j = (y + s)|0,
		k = (z + s)|0,

		t = (i + j + k) * 0.16666666667,

		x0 = x - (i - t),
		y0 = y - (j - t),
		z0 = z - (k - t),

		ii = i & 255,
		jj = j & 255,
		kk = k & 255,

		x1, y1, z1,
		x2, y2, z2,
		x3, y3, z3,
		i1, j1, k1,
		i2, j2, k2,

		n0, n1, n2, n3,
		t0, t1, t2, t3,
		gi0, gi1, gi2, gi3,

		agrad = this.grad,
		aperm = this.perm,
		aperm12 = this.perm12;

	if (x0 >= y0) {
		if(y0 >= z0) {
			i1 = i2 = j2 = 1;
			j1 = k1 = k2 = 0;
		} // X Y Z order
		else if(x0 >= z0) {
			i1 = i2 = k2 = 1;
			j1 = k1 = j2 = 0;
		} // X Z Y order
		else {
			i1 = j1 = j2 = 0;
			k1 = i2 = k2 = 1;
		} // Z X Y order
	}
	else {
		if (y0 < z0) {
			i1 = i2 = j1 = 0;
			k1 = j2 = k2 = 1;
		} // Z Y X order
		else if (x0 < z0) {
			i1 = k1 = i2 = 0;
			j1 = j2 = k2 = 1;
		} // Y Z X order
		else {
			i1 = k1 = k2 = 0;
			j1 = i2 = j2 = 1;
		} // Y X Z order
	}

	x1 = x0 - i1 + 0.16666666667;
	y1 = y0 - j1 + 0.16666666667;
	z1 = z0 - k1 + 0.16666666667;

	x2 = x0 - i2 + 0.33333333333;
	y2 = y0 - j2 + 0.33333333333;
	z2 = z0 - k2 + 0.33333333333;

	x3 = x0 - 0.5;
	y3 = y0 - 0.5;
	z3 = z0 - 0.5;

	gi0 = aperm12[ii +      aperm[jj +      aperm[kk   ]]];
	gi1 = aperm12[ii + i1 + aperm[jj + j1 + aperm[kk+k1]]];
	gi2 = aperm12[ii + i2 + aperm[jj + j2 + aperm[kk+k2]]];
	gi3 = aperm12[ii +  1 + aperm[jj +  1 + aperm[kk+ 1]]];

	t0 = 0.6 - (x0*x0 + y0*y0 + z0*z0);
	t1 = 0.6 - (x1*x1 + y1*y1 + z1*z1);
	t2 = 0.6 - (x2*x2 + y2*y2 + z2*z2);
	t3 = 0.6 - (x3*x3 + y3*y3 + z3*z3);

	n0 = n1 = n2 = n3 = 0;

	if (t0 >= 0) {
		t0 *= t0;
		n0 = t0 * t0 * dot(agrad, gi0, x0, y0, z0);
	}

	if (t1 >= 0) {
		t1 *= t1;
		n1 = t1 * t1 * dot(agrad, gi1, x1, y1, z1);
	}

	if (t2 >= 0) {
		t2 *= t2;
		n2 = t2 * t2 * dot(agrad, gi2, x2, y2, z2);
	}

	if (t3 >= 0) {
		t3 *= t3;
		n3 = t3 * t3 * dot(agrad, gi3, x3, y3, z3);
	}

	function dot(g, i, x, y, z) {return g[i] * x + g[i+1] * y + g[i+2] * z}

	return 16 * (n0 + n1 + n2 + n3) + 0.5; // [0, 1]
};
