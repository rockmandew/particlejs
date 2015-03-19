/*
	2D canvas shader for sprites

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
 */

ParticleJS.Shader2D.CanvasSprites = function(options) {

	options = options || {};

	var canvas = options.canvas,
		ctx = canvas.getContext("2d"),
		w,
		h,
		img = options.spriteSheet || null,
		isReady = img ? img.complete : false,
		cellsX = options.cellsX,
		cellsY = options.cellsY,
		count = options.count || (cellsX * cellsY),
		cw = isReady ? img.width / cellsX : 0,
		ch = isReady ? img.height / cellsY : 0,
		cwh = cw * 0.5,
		chh = ch * 0.5,
		useScan = options.useScan || false,

		clearOpacity = options.clearOpacity || 1,
		keepAlpha = options.keepAlpha || false,
		bgImage = options.image || null,

		scaleX = options.scaleX || 1,
		scaleY = options.scaleY || 1,

		// sprites
		callback = options.callback || null;

	this.init = function(e) {

		w = canvas.width = e.width;
		h = canvas.height = e.height;

		if (isReady) {
			if (callback) setTimeout(function() { callback({success:true}) }, 0);  // make async invocation
		}
		else {
			img = new Image;
			img.onload = function() {

				cw = img.width / cellsX;
				ch = img.height / cellsY;
				cwh = cw * 0.5;
				chh = ch * 0.5;

				if (callback) callback({success:true});
				isReady = true;
			};
			img.src = options.url;
		}

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

		if (isReady) {

			var cx, cy, i,
				sz = p.size;

			if (useScan) {
				i = ((count - 1) * p.lifeIndex)|0;
				cx = (i % cellsX) * cw;
				cy = ((i / cellsX)|0) * ch;

			}
			else {
				cx = (((cellsX - 1) * p.blur) | 0) * cw;
				cy = (((cellsY - 1) * p.lifeIndex) | 0) * ch;
			}

			ctx.globalAlpha = p.opacity;

			if (p.rotation) {
				ctx.translate(p.x, p.y);
				ctx.rotate(p.rotation);
				ctx.translate(-sz*0.5*scaleX, -sz*0.5*scaleY);
				ctx.drawImage(img, cx, cy, cw, ch, 0, 0, sz*scaleX, sz*scaleY);
				ctx.setTransform(1,0,0,1,0,0);
			}
			else {
				ctx.drawImage(img, cx, cy, cw, ch,
					p.x - sz*0.5*scaleX, p.y - sz*0.5*scaleY, sz*scaleX, sz*scaleY);
			}

		}
	};

	this.postRender = function(e) {
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
