/*
	2D Emitter class for ParticleJS

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
 */

/**
 * Native 2D emitter for dots. Note: It depends on the shader used with
 * this emitter what properties and settings are actually used.
 *
 * @param {*} [options] - options object
 * @param {string|*} [options.type="point"] - type of emitter: point (default), line, box, grid, - or a settings object
 * @param {number} [options.x=0] - x position of emitter
 * @param {number} [options.y=0] - y position of emitter
 * @param {number} [options.endX=100] - x end position of emitter if type is line
 * @param {number} [options.endY=0] - y end position of emitter if type is line
 * @param {number} [options.boxRadius=50] - radius for box if emitter type is box
 * @param {number} [options.gridWidth=100] - width of grid if emitter type is grid
 * @param {number} [options.gridHeight=100] - height of grid if emitter type is grid
 * @param {number} [options.cellsX=5] - number of cells in x direction for grid if emitter type is grid
 * @param {number} [options.cellsY=5] - number of cells in y direction for grid if emitter type is grid
 * @param {number} [options.birthRate=100] - initial birth rate per second
 * @param {number} [options.velocity=100] - initial velocity of an particle before optional physics are applied
 * @param {number} [options.globalForce=1] - global force factor for resulting velocity of an particle
 * @param {number} [options.life=3] - life of an particle in seconds, if 0 a bound based particle will be used instead
 * @param {number} [options.size=1] - initial size of a particle (or max size if used with size-over-life)
 * @param {number} [options.opacity=1] - initial opacity of a particle (or max opacity if used with opacity-over-life)
 * @param {number} [options.blur=0] - initial blur of a particle (or max blur if used with blur-over-life)
 * @param {number} [options.rotation=360] - initial rotation range in degrees
 * @param {number} [options.rotationOffset=0] - initial rotation offset in degrees
 * @param {number} [options.maxParticles=8000] - max number of particles to generate at any time
 * @param {number} [options.randomLife=0] - random variation based on max value of same property. 0 = no variations, 1 = full range variation
 * @param {number} [options.randomSize=0] - random variation based on max value of same property. 0 = no variations, 1 = full range variation
 * @param {number} [options.randomVelocity=0] - random variation based on max value of same property. 0 = no variations, 1 = full range variation
 * @param {number} [options.randomOpacity=0] - random variation based on max value of same property. 0 = no variations, 1 = full range variation
 * @param {number} [options.randomBlur=0] - random variation based on max value of same property. 0 = no variations, 1 = full range variation
 * @param {number} [options.randomRotation=0] - random variation based on max value of same property. 0 = no variations, 1 = full range variation
 * @param {number} [options.spreadAngle=360] - emitter spread range angle
 * @param {number} [options.spreadOffset=0] - if spreadAngle < 360 then offset will determine direction
 * @param {number} [options.r=255] - initial color of particle's red component
 * @param {number} [options.g=255] - initial color of particle's green component
 * @param {number} [options.b=255] - initial color of particle's component component
 * @param {*} [options.gradient=null] - gradient (overrides rgb color) for color-over-life
 * @param {boolean} [options.randomColor=false] - gradient (overrides rgb color) for color-over-life. If true a random color from gradient is picked.
 * @param {boolean} [options.preRender=false] - use pre-render call to shader (ie. clear each frame etc.)
 * @param {boolean} [options.postRender=false] - use pre-render call to shader
 * @param {*} [options.callback=null] - callback invoked after each particle update
 * @param {boolean} [options.reverseRenderOrder=false] - render old particles on top of new if true
 * @param {number} [options.linearTimeStepX] - if > 0 linear distribution is used
 * @param {number} [options.linearTimeStepY] - if > 0 linear distribution is used
 * @param {number} [options.linearTimeStepAngle] - if > 0 linear distribution is used
 * @param {boolean} [options.linearPingPongX] - if linear distribution use ping pong instead of continuous loop
 * @param {boolean} [options.linearPingPongY] - if linear distribution use ping pong instead of continuous loop
 * @param {boolean} [options.linearPingPongAngle] - if linear distribution use ping pong instead of continuous loop
 * @constructor
 */
ParticleJS.Emitter2D = function(options) {

	options = options || {};

	var me = this,
		w,
		h,
		deg2rad = Math.PI / 180,
		pID = 0,

		types = ['point', 'line', 'box', 'grid'],
		type = types.indexOf(options.type ? options.type : 'point'),
		x = options.x,
		y = options.y,

		// for line type
		ex = options.endX || 100,
		ey = options.endY || 0,

		// for box type
		boxRadius = options.boxRadius || 50,

		// for grid type
		gridWidth = options.gridWidth || 100,
		gridHeight = options.gridHeight || 100,
		cellsX = options.cellsX || 5,
		cellsY = options.cellsY || 5,
		cellW = gridWidth / cellsX,
		cellH = gridHeight / cellsY,

		birthRate = isNum(options.birthRate) ? options.birthRate : 100,	// particles per second
		velocity = (isNum(options.velocity) ? options.velocity : 100) * 0.01,
		gForce = isNum(options.globalForce) ? options.globalForce : 1,

		opacity = isNum(options.opacity) ? options.opacity : 1,
		size = isNum(options.size) ? options.size : 1,
		life = (isNum(options.life) ? options.life : 3) * 1000,		// -> ms
		blur = isNum(options.blur) ? options.blur : 0,

		rotation = isNum(options.rotation) ? options.rotation : 0,
		rotationRad = rotation * deg2rad,
		rotationOffset = isNum(options.rotationOffset) ? options.rotationOffset : 0,
		rotationOffRad = rotationOffset * deg2rad,

		maxParticles = isNum(options.maxParticles) ? options.maxParticles : 8000,

		rndLife = isNum(options.randomLife) ? options.randomLife : 0,
		rndVelocity = isNum(options.randomVelocity) ? options.randomVelocity : 0,
		rndOpacity = isNum(options.randomOpacity) ? options.randomOpacity : 0,
		rndSize = isNum(options.randomSize) ? options.randomSize : 0,
		rndBlur = isNum(options.randomBlur) ? options.randomBlur : 0,
		rndRotation = isNum(options.randomRotation) ? options.randomRotation : 0,

		spreadAngle = isNum(options.spreadAngle) ? options.spreadAngle : 360,
		spreadOffset = isNum(options.spreadOffset) ? options.spreadOffset : 0,
		spreadAngleRad = spreadAngle * deg2rad,
		spreadOffsetRad = spreadOffset * deg2rad,

		debug = options.debug || false,
		drawObj = null,

		shader,
		preRender = options.preRender || false,
		postRender = options.postRender || false,

		callback = options.callback || null,							// callback per particle

		count = 0,														// active particles
		revRenderOrder = options.reverseRenderOrder || false,			// render order

		particles = [],
		physics = [],
		cleanStamp = 0,
		cleanInt = 1000,

		timeStepX = options.linearTimeStepX || 0,
		timeStepY = options.linearTimeStepY || 0,
		timeStepA = options.linearTimeStepAngle || 0,
		isPingPong = options.linearPingPongX || false,
		isPingPongY = options.linearPingPongY || false,
		isPingPongA = options.linearPingPongAngle || false,
		timeNormX = 0,													// for linear emission
		timeNormY = 0,
		timeNormA = 0,													// for linear angle

		posFunc,
		timeFunc,
		angleFunc;

	/*
	 Settings
	 */

	this.sizeOverLife = new Float32Array([1]);
	this.opacityOverLife = new Float32Array([1]);
	this.blurOverLife = new Float32Array([1]);
	this.rotationOverLife = new Float32Array([1]);

	/**
	 * Current number of alive particles
	 * @type {number}
	 */
	this.count = 0;

	/**
	 * Pause time when paused. Used as basis for adding waiting time to
	 * particles is replayed. null if not in use.
	 * @type {null}
	 * @private
	 */
	this._pauseTime = null;

	/**
	 * Internal value to calc. fractional emitter rate below frame rate
	 * @type {number}
	 * @private
	 */
	this.remainder = 0;

	/*
	 	Methods
	 */

	/**
	 * This method is called from scene to initialize this emitter with
	 * settings such as size of drawing surface.
	 * @param {*} e - settings object
	 * @private
	 */
	this.init = function(e) {
		w = e.width;
		h = e.height;
		if (options.shader) me.setShader(options.shader);
	};

	/**
	 * Call to generate new particles. Current time stamp and number
	 * of particles must be provided.
	 * @param {number} time - time stamp from performance.now()
	 * @param {number} num - number of particles to generate
	 */
	this.generateParticles = function(time, num) {

		var angle = 0,
			vel,
			sz,
			o,
			f,
			r,
			l,

			pos,
			hasLife = (life > 0),
			ool,
			bol,
			sol,
			rol;

		if (hasLife) {
			ool = getOverLifeValue(this.opacityOverLife, 0);
			bol = getOverLifeValue(this.blurOverLife, 0);
			sol = getOverLifeValue(this.sizeOverLife, 0);
			rol = getOverLifeValue(this.rotationOverLife, 0);
		}
		else {
			ool = bol = sol = rol = 1;
		}

		// produce number of particles
		while(num--) {

			var p = new ParticleJS.Particle2D(life === 0);

			pos = posFunc();

			l = getSpreadValue(life, rndLife) + 16.67;					// comp. for time quantized by frame length
			vel = getSpreadValue(velocity, rndVelocity);
			sz = getSpreadValue(size, rndSize);
			o = getSpreadValue(opacity, rndOpacity);
			f = getSpreadValue(blur, rndBlur);
			r = getSpreadValue(rotationRad, rndRotation);

			angle = angleFunc(spreadAngleRad, spreadOffsetRad);

			p.id = ++pID;
			p.x = pos.x;
			p.y = pos.y;
			p.v = new Vector(angle, vel);
			p.rotationO = r;
			p.rotation = p.rotationO * rol + rotationOffRad;
			p.angle = angle;
			p.sizeO = sz;
			p.size = p.sizeO * sol;
			p.sizeR = p.sizeO * 0.5;
			p.life = l;
			p.born = time;

			p.opacityO = o;
			p.opacity = o * ool;

			p.blurO = blur;
			p.blur = blur * bol;

			p.left = 0;
			p.top = 0;
			p.width = w;
			p.height = h;

			particles.push(p);
		}

		function getSpreadValue(v, spread) {
			return v - (spread * v * Math.random());
		}
	};

	this.renderParticles = function(time, ts) {

		var i, ph;

		if (preRender) shader.preRender({
			count    : count,
			particles: particles

		});

		count = 0;

		pushParticles(particles, physics, gForce, callback);		// push particles to drawing surface

		this.count = count;

		if (postRender) shader.postRender({
			count    : count,
			total    : pID,
			particles: particles
		});

		if (debug) {
			if (!drawObj)
				drawObj = shader.getDrawObject();

			drawObj.begin();

			for(i = 0; ph = physics[i]; i++) {
				ph.showDebug({drawObject: drawObj});
				drawObj.reset();
			}

			drawObj.commit();
		}

		// update physics plugins if they are animate-able
		for(i = 0; ph = physics[i]; i++) {
			ph.updateFrame({
				count: count
			});
		}

		function pushParticles(particles, physics, globalForce, callback) {

			var t,
				p,
				em = me,
				factor = ts * globalForce;

			if (revRenderOrder) {

				for(t = particles.length - 1; p = particles[t]; t--) {
					if (count >= maxParticles) break;
					if (callback) callback({particle: p});
					updateParticle(em, factor, p);
				}

			}
			else {

				t = Math.max(0, particles.length - maxParticles);

				for(; p = particles[t]; t++) {
					if (count >= maxParticles) break;
					if (callback) callback({particle: p});
					updateParticle(em, factor, p);
				}
			}

			function updateParticle(em, factor, p) {

				var li, ph,
					i = 0,
					hasLife;

				p.updateLife(time);

				if (p.isActive) {

					hasLife = (life > 0);

					count++;

					li = p.lifeIndex;

					if (hasLife) {
						p.rotation = p.rotationO * getOverLifeValue(em.rotationOverLife, li) + rotationOffRad;
						p.opacity = p.opacityO * getOverLifeValue(em.opacityOverLife, li);
						p.blur = p.blurO * getOverLifeValue(em.blurOverLife, li);
						p.setSize(getOverLifeValue(em.sizeOverLife, li));
					}

					// calc. velocity vector based on physics and local properties of particle
					for(; ph = physics[i]; i++)
						ph.apply(p);

					p.update(factor);									// update new position

					if (p.size > 0 && p.opacity)
						shader.renderParticle(p);
				}
			}

		} // pushParticles()

	}; // renderParticles()

	/**
	 * Invoke "GC" for particles. For each call it will check a time stamp.
	 * If passed it will run through the particle array and remove dead
	 * particles to reduce memory load and increase performance.
	 * @param {number} time - current time in ms (use performance.now()).
	 */
	this.cleanupParticles = function(time) {

		// clean-up empty arrays. todo: try to find factor-based ideal time int.
		if (time - cleanInt > cleanStamp) {

			cleanStamp = time;

			// rebuild array wins over slice away:
			// http://jsperf.com/slice-away-versus-rebuilding-array
			var tmpParticles = [],
				i = 0,
				p;

			for(; p = particles[i]; i++) {
				if (p.isActive) tmpParticles.push(p);
			}

			particles = tmpParticles;
		}

	};

	/**
	 * Add a physics plugin to this emitter. Physics plugins can be
	 * shared amongst several emitters as long as they share the
	 * same dimension of the drawing surface. The physics plugin will
	 * be initialized when added. The plugins are invoked in the same
	 * order as they are added.
	 *
	 * @param {*} phys - the physics plugin to add
	 * @param {function} [callback] - optional callback invoked when initialization is complete. Use this for async plugins.
	 * @returns {ParticleJS.Emitter2D}
	 */
	this.addPhysics = function(phys, callback) {

		if (phys.init && phys.apply) {

			physics.push(phys);

			phys.init({
				width   : w,
				height  : h,
				callback: callback
			});
		}

		return this;
	};

	/**
	 * Get a reference to a physics plugin by index or id.
	 * @param {number|string} id - name or index of physics plugin
	 * @returns {*} Returns a reference to the requested plugin, or null if not found
	 */
	this.getPhysics = function(id) {

		if (typeof id === "string") {
			for(var i = 0, p; p = physics[i]; i++) {
				if (p.id === id) return p;
			}
		}
		else {
			if (id >= 0 && id < physics.length) {
				return physics[id];
			}
		}

		return null
	};

	/**
	 * Set mandatory shader to use with this emitter. Setting a shader
	 * will also initialize it.
	 *
	 * If the shader has specified a callback it will be invoked when
	 * initialized with a success property indicating if initialization
	 * was successful or not.
	 *
	 * @param {*} r - the shader to set
	 * @returns {ParticleJS.Emitter2D}
	 */
	this.setShader = function(r) {

		if (r && r.init) {

			shader = r;

			// initial call to set up drawing surface and cache
			shader.init({
				width   : w,
				height  : h
			});
		}
		else {
			throw "Not a valid shader.";
		}

		return this;
	};

	/**
	 * Use a Gradient object to set life-over values for type. Resolution
	 * defaults to 64 but can be overridden if needed. using a gradient
	 * will allow accurate interpolation between the values given. Only
	 * the red component is used.
	 *
	 * @param {string} type - type of over-life (opacity|size|blur|rotation)
	 * @param {ParticleJS.Gradient} gradient
	 * @param {number} [resolution=64] - resolution of over-life array
	 * @returns {ParticleJS.Emitter2D}
	 */
	this.overLifeGradient = function(type, gradient, resolution) {

		gradient.width = resolution || 64;
		gradient.generate();

		var arr = new Float32Array(gradient.width),
			i = 0,
			l = arr.length,
			r;

		for(; i < l; i++) {
			r = gradient.getColor(i / (l - 1)).r;
			arr[i] = r / 255;
		}

		_setOverLifeArray(type, arr);

		return this;
	};

	/**
	 * Define a Bezier curve for over-life array. Start node will always
	 * be (0,0) and end node always (1,1) so they are not provided.
	 * Use normalized values for the two control points.
	 *
	 * @param {string} type - type of over-life (opacity|size|blur|rotation)
	 * @param {number} c1x - x point of first control point
	 * @param {number} c1y - y point of first control point
	 * @param {number} c2x - x point of second control point
	 * @param {number} c2y - y point of second control point
	 * @param {number} [resolution=64] - resolution of over-life array
	 * @returns {ParticleJS.Emitter2D}
	 * @private
	 */
	this.overLifeBezier = function(type, c1x, c1y, c2x, c2y, resolution) {

		var arr = new Float32Array(resolution || 64),
			i = 0, l = arr.length - 1;

		// cache
		for(; i <= l; i++) arr[i] = bezier(i / l);

		_setOverLifeArray(type, arr);

		function bezier(t) {

			function bparam(t, duration) {

				var cx = 3 * c1x,
					bx = 3 * (c2x - c1x) - cx,
					ax = 1 - cx - bx,
					cy = 3 * c1y,
					by = 3 * (c2y - c1y) - cy,
					ay = 1 - cy - by,
					ax3 = ax * 3,
					bx2 = bx * 2;

				function calcCX(x, epsilon) {

					var t0 = 0,
						t1 = 1,
						x2, d2,
						t2 = x,
						i = 0;

					for(; i < 8; i++) {

						x2 = scX(t2) - x;
						if(Math.abs(x2) < epsilon) return t2;

						d2 = scXd(t2);
						if(Math.abs(d2) < 1e-6) break;

						t2 -= (x2 / d2);
					}

					t2 = x;

					if (t2 < t0) return t0;
					if (t2 > t1) return t1;

					while(t0 < t1) {

						x2 = scX(t2);
						if (Math.abs(x2 - x) < epsilon) return t2;

						(x > x2) ? t0 = t2 : t1 = t2;
						t2 = (t1 - t0) * 0.5 + t0;
					}

					return t2;
				}

				function scX(t) {return ((ax * t + bx) * t + cx) * t}
				function scY(t) {return ((ay * t + by) * t + cy) * t}
				function scXd(t) {return (ax3 * t + bx2) * t + cx}

				function epsilon(duration) {return 1 / (0.2 * duration)}
				function calc(x, epsilon) {return scY(calcCX(x, epsilon))}

				return calc(t, epsilon(duration));
			}

			return bparam(t, 1000);	// note: t, duration
		}

		return this;
	};

	/**
	 * Set or get this emitter's position.
	 * @param {number} [px] - position x for this emitter
	 * @param {number} [py] - position y for this emitter
	 * @returns {*} If no argument is given, current position is returned as an object
	 */
	this.position = function(px, py) {

		if (!arguments.length) return {
			x: x,
			y: y
		};

		x = px;
		y = py;

		return this;
	};

	/**
	 * Set or get position of line for line type emitter.
	 * @param {number} [x0] - x horizontal start position of line
	 * @param {number} [y0] - y vertical start position of line
	 * @param {number} [x1] - x horizontal end position of line
	 * @param {number} [y1] - y vertical end position of line
	 * @returns {*} If no argument is given, current line is returned as an object
	 */
	this.line = function(x0, y0, x1, y1) {

		if (!arguments.length) return {
			x0: x,
			y0: y,
			x1: ex,
			y1: ey
		};

		x = x0;
		y = y0;
		ex = x1;
		ey = y1;

		return this;
	};

	/**
	 * Set or get current box radius for emitter type box. Radius will
	 * set width and height of box where current position of emitter will
	 * be the box' center.
	 * @param {number} [r] - radius for box in number of pixels.
	 * @returns {*}
	 */
	this.boxRadius = function(r) {
		if (!arguments.length) return boxRadius;
		boxRadius = r;
		return this;
	};

	/**
	 * Grid size for emitter type grid. The emitter's position will be
	 * the top left corner of the grid.
	 * @param {number} gWidth - width of grid in number of pixels
	 * @param {number} gHeight - height of grid in number of pixels
	 * @returns {*}
	 */
	this.gridSize = function(gWidth, gHeight) {

		if (!arguments.length) return {
			width: gridWidth,
			height: gridHeight
		};

		gridWidth = gWidth;
		gridHeight = gHeight;

		cellW = gridWidth / cellsX;
		cellH = gridHeight / cellsY;

		return this;
	};

	/**
	 * How many grid cells to use for grid if emitter type is grid.
	 * @param {number} cx - integer number setting number of grid cells on x axis
	 * @param {number} cy - integer number setting number of grid cells on y axis
	 * @returns {*}
	 */
	this.gridCells = function(cx, cy) {

		if (!arguments.length) return {
			cellsX: cellsX,
			cellsY: cellsY
		};

		cellsX = cx;
		cellsY = cy;

		cellW = gridWidth / cellsX;
		cellH = gridHeight / cellsY;

		return this;
	};

	/**
	 * Set emitter type. Note that changing type from for example point
	 * to line will also require you to set end line point as well, for
	 * box a box radius and so on.
	 * If you use a settings object pass in an object with type and the
	 * relevant settings for that type. Example:
	 *
	 *     emitter.type({
	 *         type: "line",
	 *         x: 10,
	 *         y: 20,
	 *         endX: 400,
	 *         endY: 20
	 *     });
	 *
	 * @param {*} [etype] - can be point, line, box or grid if string, - or a settings object
	 * @returns {*} If no argument is given, current type is returned
	 */
	this.type = function(etype) {

		if (!arguments.length) return types[type];

		if (typeof etype === "object") {

			type = types.indexOf(etype.type ? etype.type : 'point');

			x = etype.x ? etype.x : x;
			y = etype.y ? etype.y : y;

			switch(etype.type) {
				case "point":
					break;
				case "line":
					ex = etype.endX ? etype.endX : ex;
					ey = etype.endY ? etype.endY : ey;
					break;
				case "box":
					boxRadius = etype.boxRadius? etype.boxRadius : boxRadius;
					break;
				case "grid":
					gridWidth = etype.gridWidth ? etype.gridWidth : gridWidth;
					gridHeight = etype.gridHeight ? etype.gridHeight : gridHeight;
					cellsX= etype.cellsX ? etype.cellsX : cellsX;
					cellsY= etype.cellsY ? etype.cellsY : cellsY;
					break;
				default:
					throw "Unknown emitter type: " + etype.type;
			}

			_setupGenFunctions();

			return this;
		}

		var newType = types.indexOf(etype);

		if (newType > -1) {
			type = newType;
			_setOverLifeArray();
		}
		else {
			throw "Unknown emitter type: " + etype;
		}

		return this;
	};

	/**
	 * Set or get birth rate for particles. Birth rate is intended to be
	 * number of particles per second but may not be that exact (alpha).
	 * @param {number} [brate] - new birth rate as a float number
	 * @returns {*} If no argument is given, current birth rate is returned
	 */
	this.birthRate = function(brate) {

		if (!arguments.length) return birthRate;

		if (brate < 0) brate = 0;
		birthRate = brate;

		return this;
	};

	/**
	 * Global blur used initially by emitter. The actual blur
	 * depends on blur-over-life as well as shader settings. This
	 * setting can be viewed as maximum possible blur where 1 =
	 * full blur, 0 = no blur. Valid range is [0, 1].
	 * @param {number} [b] - new blur value
	 * @returns {*} If no argument is given, current blur value is returned
	 */
	this.blur = function(b) {

		if (!arguments.length) return blur;

		if (b < 0) b = 0;
		else if (b > 1) b = 1;

		blur = b;

		return this;
	};

	/**
	 * Global opacity used initially by emitter. The actual opacity
	 * depends on opacity-over-life as well as shader settings. This
	 * setting can be viewed as maximum possible opacity where 1 =
	 * fully opaque, 0 = fully transparent. Valid range is [0, 1].
	 * @param {number} [o] - new opacity value
	 * @returns {*} If no argument is given, current opacity value is returned
	 */
	this.opacity = function(o) {
		if (!arguments.length) return opacity;
		opacity = Math.min(1, Math.max(0, o));
		return this;
	};

	/**
	 * Set or get life for an particle. Life is given in number of
	 * seconds using a positive float value.
	 * @param {number} [l] - float value setting life to number of seconds
	 * @returns {*} If no argument is given, current life value is returned
	 */
	this.life = function(l) {

		if (!arguments.length) return life * 0.001;
		if (l >= 0) life = l * 1000;

		return this;
	};

	/**
	 * Get or set initial velocity rate when emitted from emitter.
	 * Note that the value is given scaled (x100) and returned likewise.
	 * @param {number} vel - initial velocity
	 * @returns {*} If no argument is given, current velocity is returned
	 */
	this.velocity = function(vel) {

		if (!arguments.length) return velocity * 100;

		velocity = vel * 0.01;

		return this;
	};

	/**
	 * Get or set global size of an particle. This size is used as basis
	 * for size-over-life as well as physics plugins.
	 * @param {number} [sz] - radius in pixels
	 * @returns {*} If no argument is given, current size is returned
	 */
	this.size = function(sz) {

		if (!arguments.length) return size;

		if (sz < 1) sz = 1;
		size = sz;

		return this;
	};

	/**
	 * Set or get the total angle range an emitter will use to initially
	 * spread particles. Also see spreadOffset().
	 * @param {number} [angle] - angle range in degrees [0, 360]
	 * @returns {*} If no argument is given, current angle range is returned in degrees
	 */
	this.spreadAngle = function(angle) {

		if (!arguments.length) return angle;

		spreadAngle = angle;
		spreadAngleRad = angle * deg2rad;

		return this;
	};

	/**
	 * Spread angle offset in degrees. If spreadAngle is less than 360
	 * degrees you can use spread offset angle to determine in what
	 * direction the initial spread should occur in.
	 * @param {number} [angle] - offset angle in degrees
	 * @returns {*} If no argument is given, current angle is returned in degrees
	 */
	this.spreadOffset = function(angle) {

		if (!arguments.length) return spreadOffset;

		spreadOffset = angle;
		spreadOffsetRad = angle * deg2rad;

		return this;
	};

	/**
	 * Setting global force will affect the final resulting vector for
	 * each particle. This is useful to fine tune and control velocities.
	 * Default value is 1 (no change)
	 * @param {number} [gf] - force value (1=100%)
	 * @returns {*} if no argument is given, current global force value is returned
	 */
	this.globalForce = function(gf) {
		if (!arguments.length) return gForce;
		gForce = gf;
		return this;
	};

	/**
	 * Translate this emitter as well as all particles and physics
	 * positions where relevant.
	 * Note that translations are not tracked.
	 * @param {number} dx - delta x in pixels
	 * @param {number} dy - delta y in pixels
	 * @returns {ParticleJS.Emitter2D}
	 */
	this.translate = function(dx, dy) {

		var i, p;

		for(i = 0; p = physics[i]; i++) {
			if (p.translate) p.translate(dx, dy);
		}

		for(i = 0; p = particles[i]; i++) {
			if (p.isActive) p.translate(dx, dy);
		}

		x += dx;
		y += dy;
		ex += dx;
		ey += dy;

		return this;
	};

	this.rotate = null;

	/**
	 * Will scale all particle positions, size, velocity as well as
	 * physics plugins where relevant, as well as the emitter's own
	 * position and global size.
	 *
	 * Calling scale() from the scene object will call all attached
	 * emitter's scale() method.
	 *
	 * Note that scale is not tracked.
	 *
	 * @param {number} f - scale factor (1=100% or no change)
	 * @returns {ParticleJS.Emitter2D}
	 */
	this.scale = function(f) {

		var i, p;

		//todo since we allow sharing physics plugin this may be a problem...
		//state that user need to create two different instances of the shared
		// physics plugin if he wants to scale scene/emitter?

		// physics
		for(i = 0; p = physics[i]; i++) p.scale(f);

		// particles
		for(i = 0; p = particles[i]; i++) p.scale(f);

		x *= f;
		y *= f;
		ex *= f;
		ey *= f;
		size *=f;
		boxRadius *= f;

		return this;
	};

	/**
	 * Reversing the rendering order will render new particles first,
	 * then older so that the older particles will appear on top of the
	 * new ones. Default is false.
	 * @param {boolean} [state] - enable or disable reverse order
	 * @returns {*} if no argument is given, current state is returned
	 */
	this.reverseRenderOrder = function(state) {
		if (!arguments.length) return revRenderOrder;
		if (isBool(state)) revRenderOrder = state;
		return this;
	};

	/**
	 * Pause emitter meaning the emitter will not update any particles
	 * or physics. Call play() to continue emitter updates.
	 * @returns {ParticleJS.Emitter2D}
	 */
	this.pause = function() {

		if (!this._pauseTime) {
			this._pauseTime = performance.now();
		}

		return this;
	};

	/**
	 * Returns true if emitter has been paused.
	 * @returns {boolean}
	 */
	this.isPaused = function() {
		return !!this._pauseTime;
	};

	/**
	 * Restarts a paused or stopped emitter. The time between pausing
	 * and restart is added to each particle giving them extended life.
	 * If stopped it will start generating new particles from none.
	 * @returns {ParticleJS.Emitter2D}
	 */
	this.play = function() {

		if (this._pauseTime) {

			var diff = performance.now() - this._pauseTime + 1;  // 1ms extra compensation

			for(var i = 0, p; p = particles[i]; i++) {
				p.born += diff;
			}

			this._pauseTime = null;
		}

		return this;
	};

	/**
	 * Pauses emitter and clears all particles. Restart with play().
	 * @returns {*}
	 */
	this.stop = function() {
		return this.pause().clear();
	};

	/**
	 * Removes all particles from the particle queue. It can take an
	 * optional argument for a new birthRate.
	 * @param {number} [brate] - optional,new birth rate.
	 * @returns {ParticleJS.Emitter2D}
	 */
	this.clear = function(brate) {
		particles = [];
		if (isNum(brate)) this.birthRate(brate);
		return this;
	};

	/**
	 * Gets or sets state of pre-rendering used for this emitter.
	 * @param {boolean} [state] - set current state for pre-render
	 * @returns {*} if no argument is given current state is returned
	 */
	this.preRender = function(state) {
		if (!arguments.length) return preRender;
		if (isBool(state)) preRender = state;
		return this;
	};

	/**
	 * Gets or sets state of post-rendering used for this emitter.
	 * @param {boolean} [state] - set current state for post-render
	 * @returns {*} if no argument is given current state is returned
	 */
	this.postRender = function(state) {
		if (!arguments.length) return postRender;
		if (isBool(state)) postRender = state;
		return this;
	};

	/**
	 * Set current linear spread values for particle distribution
	 * for line, box or grid. For line only stepX is set, but for box
	 * and grid stepY must also be set, both using a normalized value
	 * [0,1]. If stepX is set but not stepY and stepY is required, stepX
	 * will be used for both. To use random spread set stepX to 0 (or -1).
	 *
	 * @param {number} [stepX] - normalized step value for line, box and grid
	 * @param {number} [stepY] - normalized step value for box and grid only
	 * @returns {*} if no arguments current step values are returned as object
	 */
	this.useLinearSpread = function(stepX, stepY) {

		if (!arguments.length) return {
			stepX: timeStepX,
			stepY: timeStepY
		};

		if (stepX <= 0) {
			timeStepX = timeStepY = 0;
		}
		else {
			timeStepX = stepX;
			timeStepY = stepY ? stepY : stepX;
			timeNormX = timeNormY = 0;
		}

		_setupGenFunctions();
		return this;
	};

	/**
	 * Set or get step for linear angular spread on an emitter. If 0
	 * random will be used instead. The spread will be between offset
	 * and angle already defined.
	 * @param {number} [step] - step value for linear angle, or 0 to disable
	 * @returns {*} if no argument is given, current step value is returned
	 */
	this.useLinearAngleSpread = function(step) {

		if (!arguments.length) return timeStepA;

		if (step <= 0) {
			timeStepA = 0;
		}
		else {
			timeStepA = step;
			timeNormA = 0;
		}

		_setupGenFunctions();
		return this;
	};

	/*
		Internals
	 */

	function isNum(n) {return (typeof n === "number")}
	function isBool(b) {return (typeof b === "boolean")}

	function getOverLifeValue(arr, t) {

		var l = arr.length - 1,
			i = (l * t) | 0;

		return arr[i] || 0;
	}

	function _setOverLifeArray(type, arr) {

		switch(type) {
			case "opacity":
				me.opacityOverLife = arr;
				return this;
			case "size":
				me.sizeOverLife = arr;
				return this;
			case "blur":
				me.blurOverLife = arr;
				return this;
			case "rotation":
				me.rotationOverLife = arr;
				return this;
		}
	}

	/**
	 * Sets up which functions to use with generating particles.
	 * @private
	 */
	function _setupGenFunctions() {

		// parent scope
		posFunc = getPosFunc();
		timeFunc = getTimeFunc();
		angleFunc = timeStepA > 0 ? getAngleLin : getAngleRnd;

		/**
		 * Choose which function to get next particle position based
		 * on emitter type.
		 * @returns {*}
		 * @private
		 */
		function getPosFunc() {
			switch(type) {
				case 1:
					return getLinePos;
				case 2:
					return getBoxPos;
				case 3:
					return getGridPos;
				default:
					return getPointPos; // case 0
			}
		}

		/**
		 * Determine which t factor to use, linear or random, and if to
		 * use 1D or 2D.
		 * @returns {*}
		 * @private
		 */
		function getTimeFunc() {
			switch(type) {
				case 0:
					return null;
				case 1:
					return (timeStepX > 0) ? get1Dlin : get1Drnd;
				case 2:
				case 3:
					return (timeStepX > 0 && timeStepY > 0) ? get2Dlin : get2Drnd;
				default:
					return null;
			}
		}

		// these functions refer to the new generated *point*, not the emitter itself

		function getPointPos() {
			return {
				x: x,
				y: y
			}
		}

		function getLinePos() {

			var t = timeFunc();

			// lerp
			function ip(a, b, t) {
				return a + (b - a) * t;
			}

			return {
				x: ip(x, ex, t),
				y: ip(y, ey, t)
			}
		}

		function getBoxPos() {

			var t = timeFunc();

			return {
				x: x + (t[0] - 0.5) * boxRadius,
				y: y + (t[1] - 0.5) * boxRadius
			}
		}

		function getGridPos() {

			var t = timeFunc(),
				ix = (t[0] * cellsX) | 0,
				iy = (t[1] * cellsY) | 0;

			return {
				x: x + ix * cellW,
				y: y + iy * cellH
			}
		}

		function get1Dlin() {

			timeNormX += timeStepX;

			if (timeNormX < 0 || timeNormX > 1) {
				if (isPingPong) {
					timeNormX = timeNormX <= 0 ? 0 : 1;
					timeStepX = -timeStepX;	//todo remember to force positive number (or direction) from method
				}
				else {
					timeNormX = 0;
				}
			}

			return timeNormX;
		}

		function get2Dlin() {

			timeNormX += timeStepX;

			// check for X
			if (timeNormX < 0 || timeNormX > 1) {
				if (isPingPong) {
					timeNormX = timeNormX <= 0 ? 0 : 1;
					timeStepX = -timeStepX;		//todo remember to force positive nimber from method
				}
				else {
					timeNormX = 0;
				}

				// check for Y
				timeNormY += timeStepY;

				if (timeNormY < 0 || timeNormY > 1) {
					if (isPingPongY) {
						timeNormY = timeNormY <= 0 ? 0 : 1;
						timeStepY = -timeStepY;
					}
					else {
						timeNormY = 0;
					}
				}
			}

			return [timeNormX, timeNormY];
		}

		function get1Drnd() {
			return Math.random();
		}

		function get2Drnd() {
			return [Math.random(), Math.random()];
		}

		function getAngleRnd(spreadAngle, spreadOffset) {
			return spreadAngle * Math.random() + spreadOffset;
		}

		function getAngleLin(spreadAngle, spreadOffset) {

			timeNormA += timeStepA;

			if (timeNormA < 0 || timeNormA > 1) {
				if (isPingPongA) {
					timeNormA = timeNormA <= 0 ? 0 : 1;
					timeStepA = -timeStepA;	//todo remember to force positive number (or direction) from method
				}
				else {
					timeNormA = 0;
				}
			}

			return spreadAngle * timeNormA + spreadOffset;
		}
	}

	/*
		Initialize
	 */

	if (typeof options.type === "object") {
		//this.type(options.type);
	}
	else {
		_setupGenFunctions();
	}

};
