/*
	Gradient class for ParticleJS

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
 */

ParticleJS.Gradient = function() {

	this.width = 256;
	this.stops = [];
	this.cache = null;
};

ParticleJS.Gradient.prototype.addStop = function(pos, color) {

	this.stops.push({
		pos: pos,
		color: color
	});

	return this;
};

ParticleJS.Gradient.prototype.generate = function() {

	var w = this.width,
		canvas = document.createElement('canvas'),
		ctx = canvas.getContext('2d'),
		gradient = ctx.createLinearGradient(0, 0, w, 0),
		idata,
		buffer,
		i = 0,
		p = 0,
		c;

	canvas.width = w;
	canvas.height = 1;

	for(; c = this.stops[i++];)
		gradient.addColorStop(c.pos, c.color);

	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, w, 1);

	idata = ctx.getImageData(0, 0, w, 1);
	buffer = idata.data;

	this.cache = new Uint8Array(w * 3);

	// save RGB (TODO alpha support?)
	for(i = 0; i < buffer.length; i += 4) {
		this.cache[p++] = buffer[i];
		this.cache[p++] = buffer[i+1];
		this.cache[p++] = buffer[i+2];
	}
};

/**
 * Get a color at position t in gradient, t being a normalized value.
 * Returns an object with r, g and b properties with the color values
 * [0, 255] for that position. Accuracy depends on initial resolution.
 *
 * @param {number} t - normalized value [0, 1] representing position
 * @returns {{r: *, g: *, b: *}}
 */
ParticleJS.Gradient.prototype.getColor = function(t) {

	t = Math.min(1, Math.max(0, t));

	var p = ((t * (this.width-1))|0) * 3;

	return {
		r: this.cache[p],
		g: this.cache[p+1],
		b: this.cache[p+2]
	};
};
