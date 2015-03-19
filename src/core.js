/*!
 *	ParticleJS version 0.2.4 ALPHA
 *
 *	Dual license - see site for details (TBA):
 *  http://epistemex.github.io/particlejs
 *
 *	By Epistemex / Ken Fyrstenberg (c) 2014-2015
 *	www.epistemex.com
*/

/*
	These tests are only to get pointers and not super-accurate results.
	It's to help making a decision for what approach to take - in cases
	where there exists doubt, better tests will be constructed.

	Test: is rebuilding an array faster than splicing indexes:
	 http://jsperf.com/slice-away-versus-rebuilding-array
	  -> rebuilding (consider circular in future)

	Test: custom forEach vs. various for loops
	 http://jsperf.com/custom-foreach-vs-for-cached
	 http://jsperf.com/for-vs-foreach/240
	  -> using for-fadeIn with cached length (see new test below)

	Test: for-fadeIn with regular condition versus using setting directly as
	conditions:
	 http://jsperf.com/for-conditionals
	  -> Interesting result. Ken style is faster on FF, setting directly
	  on Chrome. Both are many times faster than using traditional cached
	  length in this test....

	Test: double length array vs. two single arrays (typed arrays):
	 http://jsperf.com/double-array-vs-two-arrays
	  -> single arrays. In FF dbl length is faster, but singles are also
	  faster than in Chrome.. com'on Chrome, you lag behind on typed arrays!! :)

	Test: is caching random values faster than direct use:
	 http://jsperf.com/random-caching-vs-random-realtime
	 http://jsperf.com/random-vs-lookup-revisited (note: non-pre-calc'ed and float)
	  -> random() has become very fast in later versions. Unless some
	  clever replacement can be found, stick with random()

	Test: Math.sin/cos directly vs. LUT pre-calculated values
	 http://jsperf.com/math-sin-vs-lut
	 -> ...use Math.* directly - just needed to be sure!

	 Test: iterating 1D vs 2D arrays:
	  http://jsperf.com/2d-vs-1d-array-iteration
	   -> 2D was chosen for maintainability (partly deleting dead particles) but
	    the difference may not be justifiable as 1d is about 8-10x faster..

	Test: get x and y from index: manual bookkeeping, mod or reverse calc:
	 http://jsperf.com/xy-versus-mod
	  -> Appear obvious but surprisingly there is marginal difference in Chrome.
	   but reverse calc is what we'll go for.

	Test double typed array lookup vs. simple array with object
	 http://jsperf.com/2-typed-lookups-vs-object
	  -> Traditional approach seem to be awarded. Get Vector object from array.

 */

"use strict";

// public namespaces

var ParticleJS = {
	Physics2D: {},
	Shader2D : {},
	Emitter2D: {},
	//Emitter3D: {},
	Tools    : {}
};

// this is faster than the built-in method (for now..)
Array.prototype.forEach = function(fn, c) {

	//if (this === void 0 || this === null || typeof fn !== 'function') throw new TypeError;

	var t = Object(this),
		len = t.length|0,
		nc = (c === void 0 || c === null),
		i = 0;

	for (; i < len; i++) {
		if (i in t) {
			if (nc) fn(t[i], i, t);
			else fn.call(c, t[i], i, t);
		}
	}
};
