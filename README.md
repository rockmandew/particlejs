ParticleJS
==========

**ParticleJS is a real-time particle engine for JavaScript** and typically
canvas, although not limited to.

With **ParticleJS** you can make real-time effects such as smoke, flames,
dust, clouds and explosions. You can create fluids and ambient effects.

As it uses a plugin model for rendering and physics, you can render a
particle in almost unlimited ways.

The engine is for real-time use.


Features (alpha)
----------------

- Chainable plugin based physics engine (incl. wind, gravity, turbulence, vortex, magnet, waves, air resistance, collision (reflector, collector) etc.)
- Plugin based shader engines (incl. for 2D canvas)
- Shader plugins can be defined to support various particle shapes and render surfaces
- Time or region bound particles
- Opacity, and opacity over-life for each individual particle (for time bound particles)
- Feather, and feather over-life for each individual particle (for time bound particles)
- Size, and size over-life for each individual particle (for time bound particles)
- Rotation, and rotation over-life for each individual particle (for time bound particles)
- Solid color, or color gradient for over-life change for each individual particle (for time bound particles)
- Flexible over-life arrays can be of any length and engine will adopt
- Over-life arrays can be defined manually or by Bezier curves and gradients
- Particles per second birth rate
- Velocity rate
- Spread angle (z axis only for now which means it only spreads along x and y)
- Spread angle offset
- Random variations and amount of it for velocity, size, feather and opacity at birth
- Time or frame bound. Engine will adopt to current frame rate providing as smooth as possible animation with correct life time.
- Render engine supports pre-, post- and update render calls per emitter for renderer (this allow you to share drawing surface).
- Automatic GC/clean-up of dead particles and particle arrays
- Render order toggle (newest or oldest first)
- Global force parameter
- Animated turbulence (3D Perlin/Simplex noise based)


Usage
-----

More details will be published when it goes to beta. API is not 100%
settled yet as some tweaks and changes may have to be made to keep it
able to run real-time.

Demos coming...


Issues
------

We will enable issue reporting later!


License
-------

Dual license:

- Free license for personal and non-commercial use. Header required.
- For commercial and/or monetizing use, a commercial license is required (details TBA) (if you need one NOW contact us!).


Where to find us
----------------

→ Follow on [Twitter](https://twitter.com/epistemex/)


**© 2014-2015 Epistmex**

![Epistemex](http://i.imgur.com/YxO8CtB.png)
