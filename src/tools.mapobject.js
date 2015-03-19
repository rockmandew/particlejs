/*
	MapObject for Physics plugins

	(C) Epistemex 2014-2015
	Dual license - see site for details (TBA):
	http://epistemex.github.io/particlejs
 */

/**
 * Returns a map object which contains maps for angles and force for
 * a grid. The object handles quantization and initialization and more.
 * This object is used by the physics plugins as a optional convenient
 * tool.
 *
 * @param w
 * @param h
 * @param cellsX
 * @param cellsY
 * @constructor
 */
ParticleJS.Tools.GridObject = function(w, h, cellsX, cellsY) {

	var l = cellsX * cellsY;

	this.length = l;
	this.width = w;
	this.height = h;
	this.cellsX = cellsX;
	this.cellsY = cellsY;
	this.cellWidth = w / cellsX;
	this.cellHeight = h / cellsY;
	this.vectors = null;

	this.clear();
};

/**
 * Iterates through each map cell, invokes the provided function with
 * current cell x and y position. This is used to initialize a map.
 *
 * @param {function} func - callback function for each cell
 */
ParticleJS.Tools.GridObject.prototype.forEach = function(func) {

	var x,
		y = 0,
		cellsX = this.cellsX,
		cellsY = this.cellsY;

	// call host for each cell
	for(; y < cellsY; y++) {
		for(x = 0; x < cellsX; x++) {
			func(x, y);
		}
	}

};

/**
 * Returns index in map based on cell x and y indexes.
 *
 * @param {number} x - cell index x
 * @param {number} y - cell index y
 * @returns {number}
 */
ParticleJS.Tools.GridObject.prototype.getIndexFromCellXY = function(x, y) {
	return y * this.cellsY + x;
};

/**
 * Converts a pixel position into a map index. If position generates an
 * out of range index a -1 will be returned.
 *
 * @param {number} x - pixel position x
 * @param {number} y - pixel position y
 * @returns {number}
 */
ParticleJS.Tools.GridObject.prototype.getIndexFromPosXY = function(x, y) {

	var ix = (x / this.cellWidth )|0,
		iy = (y / this.cellHeight)|0,
		i = iy * this.cellsY + ix;

	if (i < 0 || i >= this.length) i = -1;

	return i;
};

/**
 * Get a cell Vector based on pixel position x and y. The position is
 * quantized internally to the cell x and y position. Returns a Vector
 * object.
 *
 * @param {number} x - pixel position x
 * @param {number} y - pixel position y
 * @returns {Vector}
 */
ParticleJS.Tools.GridObject.prototype.getVectorAtPosXY = function(x, y) {
	var i = this.getIndexFromPosXY(x, y);
	return i > -1 ? this.vectors[this.getIndexFromPosXY(x, y)] : new Vector();
};

/**
 * Get a cell Vector from x and y cell indexes
 * @param {number} x - cell index x
 * @param {number} y - cell index y
 * @returns {Vector}
 */
ParticleJS.Tools.GridObject.prototype.getVectorAtCellXY = function(x, y) {
	return this.vectors[this.getIndexFromCellXY(x, y)];
};

/**
 * Get a Vector from index.
 * @param {number} i - array index
 * @returns {Vector}
 */
ParticleJS.Tools.GridObject.prototype.getVectorAtIndex = function(i) {
	return this.vectors[i];
};

/**
 * Set a cell vector based on pixel position x and y. The position is
 * quantized internally to the cell x and y position.
 *
 * @param {number} x - pixel position x
 * @param {number} y - pixel position y
 * @param {Vector} v - vector object to set
 */
ParticleJS.Tools.GridObject.prototype.setVectorAtPosXY = function(x, y, v) {
	var i = this.getIndexFromPosXY(x, y);
	if (i > -1) this.vectors[i] = v;
};

/**
 * Set a new Vector at cell x/y
 *
 * @param {number} cx - cell index x
 * @param {number} cy - cell index y
 * @param {Vector} v - Vector object
 */
ParticleJS.Tools.GridObject.prototype.setVectorAtCellXY = function(cx, cy, v) {
	var i = this.getIndexFromCellXY(cx, cy);
	this.vectors[i] = v;
};

/**
 * Set Vector at map index i. A map length is cells X * cells Y.
 *
 * @param {number} i - map index
 * @param {Vector} v - Vector object
 */
ParticleJS.Tools.GridObject.prototype.setVectorAtIndex = function(i, v) {
	this.vectors[i] = v;
};


/**
 * Clears the maps and initializes with value 0.
 * Also needs to be called if grid size is changed.
 */
ParticleJS.Tools.GridObject.prototype.clear = function() {

	var l = this.length;
	this.vectors = new Array(l);

	for(var i = 0; i < l; i++) this.vectors[i] = new Vector();
};

/**
 * Gets distance from center of cell index cx/cy to pixel position x/y.
 * The cell index is converted to pixel position internally.
 * Returns an object with angle in radians and force.
 *
 * @param {number} cx - source cell index x
 * @param {number} cy - source cell index y
 * @param {number} x - target pixel position x
 * @param {number} y - target pixel position y
 * @returns {{angle: number, dist: number}}
 */
ParticleJS.Tools.GridObject.prototype.getAngleDist = function(cx, cy, x, y) {

	var dx = cx * this.cellWidth  + this.cellWidth  * 0.5 - x,
		dy = cy * this.cellHeight + this.cellHeight * 0.5 - y;

	return {
		angle: Math.atan2(dy, dx),
		dist : Math.abs(dx*dx + dy*dy)
	};
};

/**
 * Gets distance from center of cell index cx/cy to pixel position x/y.
 * The cell index is converted to pixel position internally.
 * Returns a Vector object.
 *
 * @param {number} cx - source cell index x
 * @param {number} cy - source cell index y
 * @param {number} x - target pixel position x
 * @param {number} y - target pixel position y
 * @returns {Vector}
 */
ParticleJS.Tools.GridObject.prototype.getAngleDistVector = function(cx, cy, x, y) {

	var v = new Vector();

	v.x = x - (cx * this.cellWidth  + this.cellWidth  * 0.5);
	v.y = y - (cy * this.cellHeight + this.cellHeight * 0.5);

	return v;
};

/**
 * Scales the grid by factor f. Typically called from hosting
 * physics plugin.
 * @param {number} f - scale factor (1=100%, or no scale)
 */
ParticleJS.Tools.GridObject.prototype.scale = function(f) {

	this.width *= f;
	this.height *= f;
	this.gridWidth = this.width / this.cellsX;
	this.gridHeight = this.height / this.cellsY;

	for(var i = 0, v; v = this.vectors[i]; i++) {
		v.scale(f);
	}
};

/**
 * Returns an object with current setup and vectors. This can be
 * manipulated or stored externally and set again using setMapObj().
 * The main purpose is to store data that are otherwise random such as
 * turbulence.
 *
 * @returns {{width: {number}, height: {number}, cellsX: {number}, cellsY: {number}, vectors: Array}}
 */
ParticleJS.Tools.GridObject.prototype.getMapObj = function() {

	return {
		width: this.width,
		height: this.height,
		cellsX: this.cellsX,
		cellsY: this.cellsY,
		vectors: this.vectors.slice(0)
	}
};

/**
 * Sets a map object and overrides internal values.
 *
 * @param {object} mapObj - a map object
 */
ParticleJS.Tools.GridObject.prototype.setMapObj = function(mapObj) {

	var l = mapObj.cellsX * mapObj.cellsY;

	if (mapObj.cellsX < 1 || mapObj.cellsY < 1 ||
		mapObj.width < 1 || mapObj.height < 1 ||
		l !== mapObj.vectors.length ||
		!mapObj.vectors[0] instanceof Vector) {
			throw "Not a correctly initialized map object.";
	}

	this.length = l;
	this.width = mapObj.width;
	this.height = mapObj.height;
	this.cellsX = mapObj.cellsX;
	this.cellsY = mapObj.cellsY;
	this.cellWidth = this.width / this.cellsX;
	this.cellHeight = this.height / this.cellsY;
	this.vectors = mapObj.vectors;

};
