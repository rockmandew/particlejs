/*
	Physics plugin for accelerator

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
 */

/**
 * Accelerator will accelerate the particle based on force and life index.
 * It will therefor not work with bound based particles.
 * @param {*} options - options for this plugin
 * @param {string} [options.id=""] - optional id to use for the instance
 * @param {number} [options.force=0] - force to use, typically in the range [0, 1]
 * @constructor
 */
ParticleJS.Physics2D.Accelerator = function(options) {

	options = options || {};

	var force = options.force || 0;

	this.id = options.id || "";

	/**
	 * If this instance needs to be re-blended
	 * @type {boolean}
	 */
	this.isDirty = true;

	/**
	 * If this plugin can be blended
	 * @type {boolean}
	 */
	this.canBlend = false;

	/**
	 * Initializes this instance. This method is called from hosting
	 * emitter(s).
	 * @param {object} e - "event" object with vital information
	 */
	this.init = function(e) {
		if (e.callback) e.callback(true);
	};

	/**
	 * Applies the physics on the current particle.
	 * This method is called from host emitter(s).
	 * @param {Particle2D} p - particle object to update
	 */
	this.apply = function(p) {
		p.v.scale(1 + force * p.lifeIndex);
	};

	/**
	 * This is called by host emitter(s) after postRender and for each
	 * frame. If the plugin need to update vector maps etc. this is the
	 * place to do that.
	 * @param e
	 */
	this.updateFrame = function(e) {
	};

	/**
	 * Requests that this module render some information to visualize
	 * how it affects a particle. Use the render object given in event
	 * to draw. The given object contains methods to draw shapes such as
	 * line, rectangle, circle etc. based on the shader and render surface
	 * used by emitter.
	 * Note that the call is invoked per frame if debug is enabled, so
	 * make sure the visualization is simple and fast to update.
	 *
	 * @param {*} e - "event" object
	 * @param {*} e.drawObj - render object with methods to draw shapes
	 */
	this.showDebug = function(e) {
	};

	/**
	 * Scales anything that needs to be scaled for this plugin. If there
	 * is nothing to scale just return itself. Things to scale are f.ex.
	 * position, sizes etc. This method is usually called from hosting
	 * emitter.
	 * @param {number} f - factor scale (1=100%, or no scale)
	 * @returns {ParticleJS.Physics2D.Accelerator}
	 */
	this.scale = function(f) {
		return this;
	};

	/*------- Special methods for this plugin only -------*/

	/**
	 * Force for this plugin.
	 * @param {number} [f] - set force of this instance
	 * @returns {*} If no argument is given, current force is returned
	 */
	this.force = function(f) {
		if (!arguments.length) return force;
		force = f;
		return this;
	};

};
