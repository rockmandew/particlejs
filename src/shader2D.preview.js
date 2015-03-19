/*
	2D canvas preview shader for debugging

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
 */

ParticleJS.Shader2D.Preview = function(canvas) {

	var ctx,
		w,
		h;

	this.init = function(e) {

		ctx = canvas.getContext('2d');
		w = canvas.width = e.width;
		h = canvas.height = e.height;
	};

	this.preRender = function() {
		ctx.clearRect(0, 0, w, h);
		ctx.beginPath();
	};

	this.renderParticle = function(p) {
		ctx.rect(p.x - p.sizeR, p.y - p.sizeR, p.size, p.size);
	};

	this.postRender = function() {
		ctx.strokeStyle = '#fff';
		ctx.stroke();
	};

	this.getDrawObject = function() {

		return {

			begin : function() {
				ctx.beginPath();
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
			}

		};
	};

};
