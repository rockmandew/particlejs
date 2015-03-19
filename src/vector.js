/*
	2D Vector class

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
 */

function Vector(angle, dist) {

	this.x = 0;
	this.y = 0;

	if (arguments.length === 2)
		this.fromAngleMag(angle, dist);
}

Vector.prototype = {

	/**
	 * Add vector to this
	 * @param {Vector} v - vector to add
	 */
	add : function(v) {
		this.x += v.x;
		this.y += v.y;
	},

	/**
	 * Add value to x and y of vector
	 * @param {number} n - value to add
	 */
	addValue : function(n) {
		this.x += n;
		this.y += n;
	},

	/**
	 * Add separate values to x and y.
	 * @param {number} x - value to add for x
	 * @param {number} y - value to add for y
	 */
	addXY : function(x, y) {
		this.x += x;
		this.y += y;
	},

	/**
	 * Add a vector after scaling it first with factor f.
	 * @param {Vector} v - vector to add
	 * @param {number} f - factor to use for scaling input vector before adding
	 */
	addScale : function(v, f) {
		this.x += v.x * f;
		this.y += v.y * f;
	},

	/**
	 * Subtract vector to this
	 * @param {Vector} v - vector to subtract
	 */
	sub : function(v) {
		this.x -= v.x;
		this.y -= v.y;
	},

	/**
	 * Subtract value to x and y of vector
	 * @param {number} n - value to subtract
	 */
	subValue : function(n) {
		this.x -= n;
		this.y -= n;
	},

	/**
	 * Subtract separate values to x and y.
	 * @param {number} x - value to subtract for x
	 * @param {number} y - value to subtract for y
	 */
	subXY : function(x, y) {
		this.x -= x;
		this.y -= y;
	},

	/**
	 * Subtract a vector after scaling it first with factor f.
	 * @param {Vector} v - vector to subtract
	 * @param {number} f - factor to use for scaling input vector before subtracting
	 */
	subScale : function(v, f) {
		this.x -= v.x * f;
		this.y -= v.y * f;
	},

	/**
	 * Multiply vector to this
	 * @param {Vector} v - vector to multiply
	 */
	mul : function(v) {
		this.x *= v.x;
		this.y *= v.y;
	},

	/**
	 * Scale (multiply) vector with factor f.
	 * @param {number} f - factor used for scaling
	 */
	scale : function(f) {
		this.x *= f;
		this.y *= f;
	},

	/**
	 * Divide vector to this
	 * @param {Vector} v - vector to divide
	 */
	div : function(v) {
		this.x /= v.x;
		this.y /= v.y;
	},

	/**
	 * Divide vector with factor f. f cannot be 0.
	 * @param {number} f - factor to divide with
	 */
	divFactor : function(f) {
		if (f) {
			this.x /= f;
			this.y /= f;
		}
	},

	/**
	 * Normalize this vector using internal distance.
	 */
	norm : function() {
		var d = this.getMag();
		this.divFactor(d);
	},

	/**
	 * Reflect this vector using a vector representing the normal
	 * to reflect about.
	 *
	 * @param {Vector|*} n - vector representing normal (if object it's required a x and y property)
	 */
	reflect : function(n) {
		var d = 2 * this.dot(this, n);
		this.x -= d * n.x;
		this.y -= d * n.y
	},

	/**
	 * Invert the vector on both axis
	 */
	invert : function() {
		this.x *= -1;
		this.y *= -1;
	},

	/**
	 * Invert the vector on the x axis
	 */
	invertX : function() {
		this.x *= -1;
	},

	/**
	 * Invert the vector on the y axis
	 */
	invertY : function() {
		this.y *= -1;
	},

	/**
	 * Rotate this vector by angle in radians
	 *
	 * @param {number} a - angle in radians
	 */
	rotate : function(a) {

		var	ty = this.x * Math.sin(a) + this.y * Math.cos(a);

		this.x = this.x * Math.cos(a) - this.y * Math.sin(a);
		this.y = ty;
	},

	/**
	 * Set this vector using an angle and distance
	 * @param {number} a - angle to use
	 * @param {number} d - distance to use
	 */
	fromAngleMag : function(a, d) {
		this.x = d * Math.cos(a);
		this.y = d * Math.sin(a);
	},

	/**
	 * Set Vector object's x and y properties.
	 * @param {number} x - vector x
	 * @param {number} y - vector y
	 */
	fromXY : function(x, y) {
		this.x = x;
		this.y = y;
	},

	/**
	 * Get normal from this vector (90 degree tangent)
	 *
	 * @returns {Vector}
	 */
	getNormal : function() {
		var a = this.getAngle();
		return new Vector(Math.sin(a), -Math.cos(a));
	},

	/**
	 * Calc dot product between two vectors.
	 *
	 * @param {Vector} v1 - vector 1
	 * @param {Vector} v2 - vector 2
	 * @returns {number} - scalar product
	 */
	dot : function(v1, v2) {
		return v1.x * v2.x + v1.y * v2.y;
	},

	/**
	 * Calc cross product between two vectors
	 *
	 * @param {Vector} v1 - vector 1
	 * @param {Vector} v2 - vector 2
	 * @returns {number} - cross product
	 */
	cross : function(v1, v2) {
		return 	v1.x * v2.x - v1.y * v2.y;
	},

	/**
	 * Get magnitude (length) of this vector.
	 *
	 * @returns {number}
	 */
	getMag : function() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	},

	/**
	 * Get non-squared magnitude (length) of this vector.
	 *
	 * @returns {number}
	 */
	getMagNoSqrt : function() {
		return this.x * this.x + this.y * this.y;
	},

	/**
	 * Get angle of this vector in radians.
	 *
	 * @returns {number}
	 */
	getAngle : function() {
		return Math.atan2(this.y, this.x);
	},

	/**
	 * Project Vector onto this.
	 *
	 * @param {Vector} v - vector to project
	 */
	project : function(v) {

		var ce = this.dot(this, v) / v.getMagNoSqrt();

		this.x = v.x * ce;
		this.y = v.y * ce;
	},

	/**
	 * Clone current Vector object and return new with same settings.
	 * @returns {Vector}
	 */
	clone : function() {
		var v = new Vector();
		v.x = this.x;
		v.y = this.y;
		return v;
	},

	toJSON : function() {
		return "{" + this.toString() + "}";
	},

	toString : function() {
		return "x: " + this.x + ", y: " + this.y;
	}

};