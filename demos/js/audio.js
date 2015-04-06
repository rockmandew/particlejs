/*
	Audio Analyzer using ParticleJS
	Ken "Epistemex" Fyrstenberg
	(c) 2014 Epistemex

 */

window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;

if (!AudioContext)
	alert('Please use Firefox or Chrome for this demo.\nThe Web Audio API is not supported in this browser.');

var	canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d'),
	w = canvas.width,
	h = canvas.height,
	cx = w * 0.5,
	cy = h * 0.5,
	isPlaying = false,
	hasEvent = false,
	state = false,
	stateImg = document.getElementById('state'),

	audioEl = document.createElement('audio'),
	actx = new AudioContext(),
	srcNode,
	analyser,
	audio,
	value = 0,
	fft,
	fftS,
	fftLen,
	fftLen2,
	src,
	path = 'audio/pvp_colibris',
	delta = 2,
	steps = 32,
	angleStep = 2*Math.PI/(steps-1),
	globalAngle = 0,
	iRad = 60,
	oRad = cy*0.9,

	scene,
	emitter,
	shader,
	gradient,

	vortex,
	turb,

	gBlur,
	gOpac,
	gSize;

ctx.fillStyle = 'rgba(255,255,255,0.33)';
ctx.fillRect(0, h*0.5 - 30, w, 60);
ctx.fillStyle = '#fff';
ctx.font = 'bold 24px sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('Loading and decoding audio...', w*0.5, h*0.5);
ctx.fillStyle = '#d02';

if (audioEl.canPlayType('audio/mpeg')) {
	src = path + '.mp3';
}
else if (audioEl.canPlayType('audio/ogg')) {
	src = path + '.ogg';
}

if (src) audioEl.addEventListener('canplay', setup, false);

audioEl.preload = 'auto';
audioEl.autoplay = false;
audioEl.src = src;

function setup() {

	if (hasEvent) return;
	hasEvent = state = true;	// attempt to work around hick-ups in FF..

	// create scene
	scene = new ParticleJS.Scene({
		width: canvas.width,
		height: canvas.height
	});

	gradient = new ParticleJS.Gradient()
		.addStop(0   , 'rgb(255, 255, 255)')
		.addStop(0.02 , 'rgb(255,255,255)')
		.addStop(0.5 , 'rgb(20,0,255)')
		.addStop(1   , 'rgb(255,0,40)');

	shader = new ParticleJS.Shader2D.Canvas({
		canvas      : canvas,
		gradient    : gradient,
		clearOpacity: 0.25,
		sizeCells   : 5,
		colorCells  : 40,
		spriteSize  : 32
	});

	emitter = new ParticleJS.Emitter2D({
		type          : 'line',
		x             : w*0.5,
		y             : h*0.5,
		endX		  : 0,
		endY          : 0,
		birthRate     : 7,
		velocity      : 0,
		randomVelocity: 0.4,
		life          : 1.8,
		randomLife    : 0.3,
		spreadAngle   : 180,
		spreadOffset  : 80,
		size          : 64,
		randomSize    : 0.5,
		blur          : 0.5,
		randomBlur    : 0.3,
		opacity       : 0.5,
		randomOpacity : 0.3,
		shader        : shader,
		preRender     : true,
		maxParticles  : 3500
	});

	scene.addEmitter(emitter);

	vortex = new ParticleJS.Physics2D.Vortex({
		x: cx,
		y: cy,
		radius: cx*2,
		force: 0.1,
		suction: -1,
		direction: 'ccw'
	});

	turb = new ParticleJS.Physics2D.Turbulence({
		cellsX: 16,
		cellsY: 16,
		force: 0.2
	});

	emitter.addPhysics(vortex)
		   .addPhysics(turb)
		   .globalForce(0.9)
		   .reverseRenderOrder(true);

	gBlur = new ParticleJS.Gradient()
		.addStop(0, "#200")
		.addStop(0.75, "#f00")
		.addStop(1, "#f00");

	gOpac = new ParticleJS.Gradient()
		.addStop(0, "#f00")
		.addStop(0.5, "#f00")
		.addStop(1, "#000");

	gSize = new ParticleJS.Gradient()
		.addStop(0, "#000")
		.addStop(1, "#f00");

	emitter.overLifeGradient("blur", gBlur);
	emitter.overLifeGradient("size", gSize);
	emitter.overLifeGradient("opacity", gOpac);

	//emitter.blurOverLife = new Float32Array([0.2, 0.25, 0.3, 0.35, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
	//emitter.sizeOverLife = new Float32Array([0.1, 0.2, 0.4, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]);
	//emitter.opacityOverLife = new Float32Array([1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1,0])

	ctx.strokeStyle = '#fff';
	ctx.globalAlpha = 1;

	// audio
	audioEl.play();

	analyser = actx.createAnalyser();
	analyser.smoothingTimeConstant = 0.7;
	analyser.fftSize = 128;

	srcNode = actx.createMediaElementSource(audioEl);

	srcNode.connect(analyser);
	srcNode.connect(actx.destination);

	fftLen = analyser.frequencyBinCount;
	fft = new Uint8Array(fftLen);
	fftS = new Uint8Array(fftLen);
	fftLen2 = Math.ceil(analyser.frequencyBinCount * 10000 / (actx.sampleRate / 2));
	
	ctx.strokeStyle = '#fff';
	ctx.lineWidth = 4;
	ctx.lineCap = 'round';

	if (!isPlaying) draw();
}

function draw() {

	isPlaying = true;

	analyser.getByteFrequencyData(fft);

	var i = 2,
		sz = 0,
		v, f,
		time = performance.now();

	globalAngle += 0.005;
	globalAngle = globalAngle % (Math.PI*2);

	ctx.beginPath();

	for(; i < fftLen2; i += 2) {
		v = fft[i];
		sz += v;
	}

	f = sz / (steps*255);

	turb.force(0.02 + 0.08 * f);

	for(i = 0; i < fftLen2; i += 2) {

		v = fft[i];

		//if (v > fftS[i]) fftS[i] = v;
		if (fft[i] >= delta) fft[i] -= delta;

		var a = angleStep * id,
			l = (oRad - iRad) * (fft[i] / 255) + 1 + iRad,
			c = Math.cos(a+globalAngle),
			s = Math.sin(a+globalAngle),
			x0 = iRad * c + cx,
			y0 = iRad * s + cy,
			x1 = l * c + cx,
			y1 = l * s + cy;

		ctx.moveTo(x0, y0);
		ctx.lineTo(x1, y1);

		emitter.size(2 + 150 * f);
		emitter.line(x0, y0, x1, y1);
		emitter.spreadAngle(a + 0.5*Math.PI);

		if (i % 2 === 0 && !(audioEl.paused || audioEl.ended)) emitter.generateParticles(time, 1);
 	}

	scene.renderNoGeneration();

	ctx.globalAlpha = f;
	ctx.stroke();

	ctx.fillStyle = '#003';

	requestAnimationFrame(draw);
}

audioEl.addEventListener('ended', function() {
	state = false;
	stateImg.src = 'gfx/play.png';
	audioEl.pause();
}, false);

stateImg.addEventListener('click', function() {

	if (state) {
		state = false;
		this.src = 'gfx/play.png';
		audioEl.pause();
	}
	else {
		state = true;
		this.src = 'gfx/pause.png';
		audioEl.play();
	}

}, false);
