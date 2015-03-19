/*
	Tools for turbulence physics plugins

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
 */

ParticleJS.Tools.getMapImage = function(map, fg, bg) {

	var canvas = document.createElement('canvas'),
		ctx = canvas.getContext('2d'),
		r = map.cellWidth * 0.5;

	canvas.width = map.width;
	canvas.height = map.height;

	if (bg) {
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	ctx.strokeStyle = fg ? fg : '#fff';

	map.forEach(function(x, y) {

		var v = map.getVectorAtCellXY(x, y),
			f = v.getMag(),
			rf = r * f;

		ctx.setTransform(1, 0, 0, 1, x * map.cellWidth + r, y * map.cellHeight + map.cellHeight * 0.5);

		if (f) {
			ctx.rotate(v.getAngle());
			ctx.moveTo(-rf, 0);
			ctx.lineTo(rf, 0);
			ctx.rect(rf, -1, 2, 2);
		}
		else
			ctx.rect(-0.5, -0.5, 1, 1);

	});

	ctx.stroke();

	return canvas;
};

