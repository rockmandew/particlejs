/*
	Class for 2D canvas shader.

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
 */

ParticleJS.Shader2D.Canvas = function(options) {

	options = options || {};

	var canvas = options.canvas,
		ctx,
		w,
		h,
		clipArr = null,
		spriteSize = options.spriteSize || 32,
		spriteHalfSize = spriteSize * 0.5,

		clearOpacity = options.clearOpacity || 1,
		keepAlpha = options.keepAlpha || false,
		bgImage = options.image || null,

		gradient = options.gradient || null,
		hasGradient = (gradient !== null),
		rndColor = options.randomColor || false,
		red = isNum(options.r) ? options.r : 255,
		green = isNum(options.g) ? options.g : 255,
		blue = isNum(options.b) ? options.b : 255,

		scaleX = options.scaleX || 1,
		scaleY = options.scaleY || 1,
		scaleXH = scaleX * 0.5,
		scaleYH = scaleY * 0.5,

		// sprites
		scnt = options.sizeCells || 30,
		sstep = 1 / scnt,
		ccnt = options.colorCells || 32,
		scnt1 = scnt - 1,
		ccnt1 = ccnt - 1,
		sprite = document.createElement('canvas'),
		spriteHalf = document.createElement('canvas'),
		cs = sprite.getContext('2d'),
		csHalf = spriteHalf.getContext('2d'),

		callback = options.callback || null;

	this.init = function(e) {

		w = canvas.width = e.width;
		h = canvas.height = e.height;
		ctx = canvas.getContext('2d');

		sprite.width = spriteSize * scnt;
		sprite.height = hasGradient ? spriteSize * ccnt : spriteSize;

		if (!hasGradient) {
			ccnt = 0;
		}
		else {
			gradient.generate();
		}

		spriteHalf.width = sprite.width >> 1;
		spriteHalf.height = sprite.height >> 1;

		initSprites();

		if (typeof ctx.imageSmoothingEnabled !== 'undefined') ctx.imageSmoothingEnabled = false;
		else if (typeof ctx.oImageSmoothingEnabled !== 'undefined') ctx.oImageSmoothingEnabled = false;
		else if (typeof ctx.msImageSmoothingEnabled !== 'undefined') ctx.msImageSmoothingEnabled = false;
		else if (typeof ctx.mozImageSmoothingEnabled !== 'undefined') ctx.mozImageSmoothingEnabled = false;
		else if (typeof ctx.webkitImageSmoothingEnabled !== 'undefined') ctx.webkitImageSmoothingEnabled = false;

		ctx.fillStyle = 'rgba(0,0,0,' + clearOpacity + ')';

		if (callback) setTimeout(function() { callback({success:true}) }, 9);  // make async invocation
	};

	this.getDrawObject = function() {

		return {

			begin : function() {
				ctx.beginPath();
			},

			close : function() {
				ctx.closePath();
			},

			arc : function(x, y, r, sa, ea, ccw) {
				ctx.moveTo(x + r, y);
				ctx.arc(x, y, r, sa, ea, ccw ? ccw : false);
			},

			circle : function(x, y, r) {
				ctx.moveTo(x + r, y);
				ctx.arc(x, y, r, 0, 2*Math.PI);
			},

			rect : function(x, y, w, h) {
				ctx.rect(x, y, w, h);
			},

			moveTo : function(x, y) {
				ctx.moveTo(x, y);
			},

			lineTo : function(x, y) {
				ctx.lineTo(x, y);
			},

			line : function(x1, y1, x2, y2) {
				ctx.moveTo(x1, y1);
				ctx.lineTo(x2, y2);
			},

			commit : function() {
				ctx.strokeStyle = '#fff';
				ctx.stroke();
			},

			rotate : function(angle) {
				ctx.rotate(angle);
			},

			translate : function(dx, dy) {
				ctx.translate(dx, dy);
			},

			reset : function() {
				ctx.setTransform(1,0,0,1,0,0);
			},

			width: w,
			height: h
		};
	};

	this.preRender = function() {

		//todo optimize this by ind. functions set based on type

		if (clearOpacity === 1) {
			if (bgImage) {
				ctx.drawImage(bgImage, 0, 0, w, h);
			}
			else
				ctx.clearRect(0, 0, w, h)
		}
		else {
			ctx.globalAlpha = clearOpacity;

			if (bgImage) {
				ctx.drawImage(bgImage, 0, 0, w, h);
			}
			else if (keepAlpha) {
				ctx.globalCompositeOperation = 'source-atop';
				ctx.fillRect(0, 0, w, h);
				ctx.globalCompositeOperation = 'source-over';
			}
			else {
				ctx.fillRect(0, 0, w, h);
			}
		}
	};

	this.renderParticle = function(p) {

		var fi = (scnt1 * p.blur)|0,		// blur index
			sx = fi * spriteSize,
			ci = rndColor ? (ccnt1 * Math.random())|0 : hasGradient ? (ccnt1 * p.lifeIndex)|0 : 0,	// color index
			sy = ci * spriteSize,
			size = p.size;

		ctx.globalAlpha = p.opacity;

		if (size > spriteHalfSize) {
			ctx.drawImage(sprite, sx, sy, spriteSize, spriteSize,
				(p.x - size * scaleXH)|0, (p.y - size * scaleYH)|0, size * scaleX, size * scaleY);
		}
		else {
			ctx.drawImage(spriteHalf, sx>>1, sy>>1, spriteHalfSize, spriteHalfSize,
				(p.x - size * scaleXH)|0, (p.y - size * scaleYH)|0, size * scaleX, size * scaleY);
		}

	};

	this.postRender = function(e) {
		//todo temp impl. for debugging
		//var fs = ctx.fillStyle;
		ctx.fillStyle = '#fff';
		ctx.globalAlpha = 1;
		ctx.fillText(e.count, 10, 10);
		//ctx.fillStyle = fs;
	};

	// methods for this shader

	this.clear = function() {
		if (w) ctx.clearRect(0, 0, w, h);
		return this;
	};

	this.clearOpacity = function(o) {
		if (!arguments.length) return clearOpacity;
		clearOpacity = o;
		ctx.fillStyle = 'rgba(0,0,0,' + clearOpacity + ')';
		return this;
	};

	this.keepAlpha = function(kAlpha) {
		if (typeof kAlpha === 'boolean') {
			keepAlpha = kAlpha;
			return this;
		}
		else {
			return keepAlpha;
		}
	};

	/**
	 * Sets a clip mask on canvas. The array consists of point object
	 * with x and y properties. The array must be minimum 3 points long.
	 * @param {Array} cArr - point array for polygon used to clip canvas
	 */
	this.setClip = function(cArr) {

		ctx.save();

		if (!Array.isArray(cArr) || cArr.length < 3) throw 'Need a polygon array';
		clipArr = cArr;

		ctx.beginPath();
		ctx.moveTo(cArr[0].x, cArr[0].y);

		for(var i = 0, p; p = cArr[i]; i++) {
			ctx.lineTo(p.x, p.y);
		}

		ctx.clip();

		return this;
	};

	this.removeClip = function(force) {
		ctx.restore();
		if (force) {
			ctx.canvas.height = ctx.canvas.height - 1;
			ctx.canvas.height = ctx.canvas.height + 1;
		}
		return this;
	};

	function initSprites() {

		var	i = 0,
		    featherR,
		    szF;

		cs.clearRect(0, 0, cs.canvas.width, cs.canvas.height);

		cs.save();

		cs.shadowColor = hasGradient ? "#fff" : 'rgb(' + red + ',' + green + ',' + blue + ')';

		for(; i < scnt; i++) {

			featherR = spriteHalfSize * i * sstep * 0.67;
			szF = spriteHalfSize - featherR;

			cs.beginPath();
			cs.arc(-spriteHalfSize, spriteHalfSize, szF, 0, 2*Math.PI);
			cs.shadowOffsetX = spriteSize * (i + 1);
			cs.shadowBlur = featherR;
			cs.fill();
		}

		cs.restore();

		if (hasGradient) {

			for(i = spriteSize; i < sprite.height; i *= 2) {
				cs.drawImage(sprite, 0, 0, sprite.width, i, 0, i, sprite.width, i);
			}

			cs.globalCompositeOperation = 'source-atop';

			for(i = 0; i < ccnt; i++) {
				var c = gradient.getColor(i / ccnt);
				cs.fillStyle = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
				cs.fillRect(0, i * spriteSize, sprite.width, spriteSize);
			}
		}

		csHalf.clearRect(0, 0, spriteHalf.width, spriteHalf.height);

		csHalf.drawImage(sprite, 0, 0, sprite.width, sprite.height,
			0, 0, spriteHalf.width, spriteHalf.height);

	}

	function isNum(n) {return (typeof n === "number")}
};
