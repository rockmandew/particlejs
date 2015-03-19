/*
	Particle class for ParticleJS

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
*/

ParticleJS.Particle2D = function(isBound) {

	this.id				= 0;

	this.x				= 0;
	this.y				= 0;
	this.px				= 0;			// prev. position
	this.py				= 0;
	this.v				= null; 		//new Vector();
	this.vr				= 0;
	this.velocity		= 0;
	this.spreadAngle	= 0;
	this.angle			= 0;

	this.rotationO		= 0;
	this.rotation		= 0;
	this.size			= 0;			// current size
	this.sizeR			= 0;			// size radius
	this.sizeO			= 0;			// original size
	this.opacity		= 1;			// 0-1
	this.opacityO		= 1;			// 0-1
	this.blur			= 0;			// 0-1
	this.blurO			= 0;			// 0-1

	this.born			= 0;			// timestamp
	this.life			= 0;			// in milliseconds
	this.lifeIndex		= 0;			// for size/opacity over time, 0-1

	this.left			= 0;			// for 0-life use (if outside bounds)
	this.top			= 0;
	this.width			= 0;
	this.height			= 0;

	this.isHit			= false;		// for collision detection
	this.isActive		= true;

	this.updateLife		= isBound ? this.updateLifeBound : this.updateLifeTime;
};

ParticleJS.Particle2D.prototype = {

	/**
	 * Update position for this particle by adding current vector
	 * @param {number} f = scale factor, default: 1
	 * @private
	 */
	update : function(f) {
		//this.px = this.x;												// update previous position
		//this.py = this.y;
		this.x += this.v.x * f;
		this.y += this.v.y * f;
		this.rotation += this.vr * f;
	},

	/**
	 * Updates the life of this particle. Normalized range [0,1] for lifeIndex.
	 * @param {number} time - timeStamp from performance.now()
	 * @private
	 */
	updateLifeTime : function(time) {

		if (this.isActive) {

			var lived = time - this.born;

			this.lifeIndex = Math.max(0, Math.min(lived / this.life, 1)); // index: [0, 1], life: [0, 1> ->
			this.isActive = (this.lifeIndex < 1);						  // particle is considered dead at li=1
		}

	},

	/**
	 * Updates the bound test of this particle.
	 * @private
	 */
	updateLifeBound : function() {

		var x = this.x,
			y = this.y;

		if (this.isActive) {
			this.isActive = (x >= this.left && x < this.width && y >= this.top && y < this.height);
		}

	},

	/**
	 * Called when a particle is created and updated. Uses original size
	 * to calculate radius as well as current size based on factor sz
	 * (calculated internally).
	 * @param sz
	 * @private
	 */
	setSize : function(sz) {
		this.size = this.sizeO * sz;
		this.sizeR = this.size * 0.5;
	},

	/**
	 * Kill this particle. Sets velocity vector to 0
	 * and isActive = false, lifeIndex = 1
	 */
	kill : function() {
		this.isActive = false;
		this.lifeIndex = 1;
		this.vx = this.vy = this.vr = 0;
	},

	/**
	 * Calculate position's current angle based on previous and current
	 * position. This can be different than velocity angle.
	 * @returns {number} Angle in radians
	 */
	getPositionAngle : function() {

		var dx = this.px - this.x,
			dy = this.py - this.y;

		return Math.atan2(dy, dx);
	},

	/**
	 * Calculate current vector angle. This can be different than
	 * direction angle.
	 * @returns {number} Angle in radians
	 */
	getVelocityAngle : function() {
		return this.v.getAngle();
	},

	/**
	 * Get squared length between previous and current position.
	 * This length is in actual pixels.
	 * @returns {number}
	 */
	getVelocityLengthSqrt : function() {

		var dx = this.px - this.x,
			dy = this.py - this.y;

		return Math.sqrt(dx*dx + dy*dy);
	},

	/**
	 * Get non-squared length between previous and current position.
	 * This can be used for performance critical use.
	 * @returns {number}
	 */
	getVelocityLengthNoSqrt : function() {

		var dx = this.px - this.x,
			dy = this.py - this.y;

		return dx*dx + dy*dy;
	},

	/**
	 * Scale position and velocity by factor f. Scaling will result in
	 * a new absolute position, size and velocity.
	 * @param {number} f - factor to scale by 1 = 100%/no scaling
	 */
	scale : function(f) {
		this.x *= f;
		this.y *= f;
		this.vx *= f;
		this.vy *= f;
		this.sizeO *= f;
	},

	/**
	 * Translate this particle by delta x and y.
	 * Note that translation is not tracked and will result in a new
	 * absolute position.
	 * @param {number} dx - delta x
	 * @param {number} dy - delta y
	 */
	translate : function(dx, dy) {
		this.x += dx;
		this.y += dy;
		this.px += dx;
		this.py += dy;
	}
};
