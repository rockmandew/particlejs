/*
	Helper class.
	Generate cache for 2D canvas based renderers

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
 */

ParticleJS.Cache = function(options) {

	var hor = options.horizontal,							// number of hor. tiles (blur)
		ver = options.vertical,								// number of vertical tiles (colors)
		sz = options.size,									// max size of one tile (for quadratic use)

		w = hor * sz,
		h = ver * sz,
		wh = w<<1,
		hh = h<<1,

		stepH = 1 / hor,

		canvas = document.createElement('canvas'),			// the full sprite
		canvasH = document.createElement('canvas'),			// the half size sprite (25%)
		ctx = canvas.getContext('2d'),
		ctxH = canvasH.getContext('2d'),

		i = 0;

	//todo: possible memory errors should be caught when creating the canvas elements

	canvas.width = w;
	canvas.height = h;

	canvasH.width = wh;
	canvasH.height = hh;

	//todo create callback mechanism, draw in sizes, replicate vertical, color



	ctxH.drawImage(canvas, 0, 0, wh, hh);

	this.sprite = canvas;
	this.spriteHalf = canvasH;
};