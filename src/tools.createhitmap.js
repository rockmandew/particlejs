/*
	Creates a hit map object that can be used by physics plugins which
	needs collision detection.

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
 */

ParticleJS.Tools.CreateHitMapFromLine = function(w, h, x1, y1, x2, y2, radius, factor) {

	factor = factor || 1;

	// setup hit array
	var canvas,
		ctx,
		idata,
		buffer,
		l,
		i = 0,

		hitRegion = new Uint16Array(6),
		hitArray,

		_radius = Math.max(1, radius>>factor),
		_x1 = x1>>factor,
		_y1 = y1>>factor,
		_x2 = x2>>factor,
		_y2 = y2>>factor,
		_w = w>>factor,
		_h = h>>factor,

		useRegionOnly = false;

	// calc hit region
	hitRegion[0] = Math.max(0, Math.min(_x1, _x2) - _radius);					// x
	hitRegion[1] = Math.max(0, Math.min(_y1, _y2) - _radius);					// y
	hitRegion[2] = Math.min(_w, Math.max(_x1, _x2) - hitRegion[0] + _radius);	// w
	hitRegion[3] = Math.min(_h, Math.max(_y1, _y2) - hitRegion[1] + _radius);	// h
	hitRegion[4] = hitRegion[0] + hitRegion[2];									// right
	hitRegion[5] = hitRegion[1] + hitRegion[3];									// bottom

	//TODO we can consider off-screen canvas and use isPointInPath as an option.
	// do speed-test! Path2D objects do not seem to support isPointIn* !! :-O

	if (x1 === x2 || y1 === y2) {
		useRegionOnly = true;
	}
	else {
		canvas = document.createElement('canvas');
		ctx = canvas.getContext('2d');

		canvas.width = _w;
		canvas.height = _h;

		ctx.strokeStyle = '#fff';
		ctx.lineWidth = _radius;
		ctx.lineCap = 'round';

		ctx.moveTo(_x1, _y1);
		ctx.lineTo(_x2, _y2);
		ctx.stroke();

		idata = ctx.getImageData(hitRegion[0], hitRegion[1], hitRegion[2], hitRegion[3]);
		buffer = new Uint32Array(idata.data.buffer);
		l = buffer.length;

		hitArray = new Uint8Array(l);

		// make hit bitmap for region only
		for(; i < l; i++) {
			hitArray[i] = Math.min(1, buffer[i]);
		}
	}

	this.test = function(x, y) {

		x = (x>>factor) - hitRegion[0];
		y = (y>>factor) - hitRegion[1];

		// is in the "area"?
		if (x >= 0 && x < hitRegion[2] && y >= 0 && y < hitRegion[3]) {

			// and on an actual pixel?
			if (useRegionOnly) {
				return true;
			}
			else {
				var i = hitRegion[2] * y + x;
				if (hitArray[i]) return true;
			}
		}

		return false;
	};

};

