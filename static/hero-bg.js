/* Gensolve hero background — live generative shaders (WebGL 1, no libraries).
 *
 * Styles: liquid | aurora | contour | mesh. Pick one with <canvas data-style="...">.
 * Performance rules (the site must stay smooth on phones):
 *   - drawn at reduced resolution and scaled up (the visuals are soft, so it can't be seen)
 *   - capped at 60fps on desktop, 30fps on touch devices
 *   - paused while the hero is off screen or the tab is hidden
 *   - one still frame for prefers-reduced-motion; no WebGL -> canvas is removed (CSS look remains)
 * Colours come from the page's CSS variables (--g1 --g2 --g3 --bg), so light/dark just works.
 */
(function () {
  var canvas = document.querySelector('canvas.hero-bg');
  if (!canvas) return;

  var gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power', premultipliedAlpha: false });
  if (!gl) { canvas.remove(); return; }
  var derivatives = !!gl.getExtension('OES_standard_derivatives');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  var FRAME_MS = coarse ? 1000 / 30 : 1000 / 60;
  if (/[?&]uncapped/.test(location.search)) FRAME_MS = 0;   // recording only: draw every display frame
  var SCALE = { liquid: 0.5, aurora: 0.5, mesh: 0.4, contour: 0.85 };

  var VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

  var COMMON = [
    'precision highp float;',
    'uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;uniform float uLight;uniform float uDim;uniform float uScroll;',
    'uniform vec3 uC1;uniform vec3 uC2;uniform vec3 uC3;uniform vec3 uBg;',
    // Ashima simplex noise (MIT)
    'vec3 m289(vec3 x){return x-floor(x*(1./289.))*289.;}vec2 m289(vec2 x){return x-floor(x*(1./289.))*289.;}',
    'vec3 perm(vec3 x){return m289(((x*34.)+1.)*x);}',
    'float snoise(vec2 v){const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);',
    'vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);',
    'vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=m289(i);',
    'vec3 p=perm(perm(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));',
    'vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m;m=m*m;',
    'vec3 x=2.*fract(p*C.www)-1.;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);vec3 a0=x-ox;',
    'm*=1.79284291400159-.85373472095314*(a0*a0+h*h);',
    'vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.*dot(m,g);}',
    'float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,-.6,.6,.8);for(int i=0;i<5;i++){v+=a*snoise(p);p=r*p*2.03+1.7;a*=.5;}return v;}',
    'float fbm3(vec2 p){float v=0.,a=.55;mat2 r=mat2(.8,-.6,.6,.8);for(int i=0;i<3;i++){v+=a*snoise(p);p=r*p*1.9+1.7;a*=.45;}return v;}',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
    // shared finish: blend the art over the page background, soft vignette and film grain
    'vec3 finish(vec3 col,vec2 uv){float vig=smoothstep(1.25,.25,length((uv-.5)*vec2(1.1,1.3)));',
    'col=mix(uBg,col,vig);col=mix(col,uBg,uDim);col+=(hash(uv*uRes+fract(uTime))-.5)*(uLight>.5?.012:.02);return col;}'
  ].join('\n');

  var FRAG = {
    // 1. LIQUID — domain-warped noise: silky ink-in-water flow
    liquid: [
      'void main(){vec2 uv=gl_FragCoord.xy/uRes;vec2 p=(uv-.5)*vec2(uRes.x/uRes.y,1.)*.85;',
      'float t=uTime*.05+uScroll*.00035;p+=(uMouse-.5)*.18;p.y-=uScroll*.00012;',
      'vec2 q=vec2(fbm3(p+vec2(0.,t)),fbm3(p+vec2(5.2,1.3)-t));',
      'vec2 r=vec2(fbm3(p+1.7*q+vec2(1.7,9.2)+.6*t),fbm3(p+1.7*q+vec2(8.3,2.8)-.5*t));',
      'float f=fbm3(p+1.6*r);',
      'vec3 col=uBg;',
      'col=mix(col,uC1,smoothstep(-.15,.75,f)*.8);',
      'col=mix(col,uC2,smoothstep(.1,.95,length(q))*.85);',
      'col=mix(col,uC3,smoothstep(.3,1.05,r.x)*.6);',
      'float lift=uLight>.5?.05:.24;col=mix(uBg,col,.6+lift+.25*smoothstep(-.4,.8,f));',
      'col+=uC2*.06*smoothstep(.2,1.,length(r))*(uLight>.5?0.:1.);',
      'gl_FragColor=vec4(finish(col,uv),1.);}'
    ].join('\n'),

    // 2. AURORA — three drifting curtains of light with vertical rays
    aurora: [
      'float curtain(vec2 uv,float off,float spd,float y0){',
      'float t=uTime*spd;float w=snoise(vec2(uv.x*1.3+off,t*.6))*.13+snoise(vec2(uv.x*3.1-off,t))*.04;',
      'float d=uv.y-(y0+w);float band=exp(-d*d*38.)*smoothstep(-.02,.25,-d+.18);',
      'float rays=.72+.28*snoise(vec2(uv.x*11.+off*7.,t*1.2));return band*rays;}',
      'void main(){vec2 uv=gl_FragCoord.xy/uRes;uv.x=uv.x*uRes.x/uRes.y*.6+(uMouse.x-.5)*.08;',
      'float a=curtain(uv,0.,.10,.70),b=curtain(uv,3.7,.08,.60),c=curtain(uv,8.1,.12,.78);',
      'vec3 glow=uC1*a+uC2*b*1.1+uC3*c*.8;',
      'float k=uLight>.5?.75:1.1;vec3 col=uLight>.5?mix(uBg,uBg-glow*.55,1.):uBg+glow*k;',
      'col+=uC2*.04*smoothstep(.3,1.,uv.y);',
      'gl_FragColor=vec4(finish(col,gl_FragCoord.xy/uRes),1.);}'
    ].join('\n'),

    // 3. CONTOUR — glowing topographic lines of a slowly morphing landscape
    contour: [
      'void main(){vec2 uv=gl_FragCoord.xy/uRes;vec2 p=(uv-.5)*vec2(uRes.x/uRes.y,1.)*1.35;',
      'float t=uTime*.035;vec2 m=(uMouse-.5)*vec2(uRes.x/uRes.y,1.)*1.35;',
      'float h=fbm3(p*.7+vec2(t,-t*.7))+.3*exp(-dot(p-m,p-m)*3.);',
      'float levels=9.;float x=h*levels;float f=abs(fract(x)-.5);',
      DERIV_LINE(),
      'vec3 tint=mix(mix(uC1,uC2,smoothstep(-.6,.6,p.x)),uC3,smoothstep(.2,.9,h));',
      'float glow=line*(.32+.4*smoothstep(-.5,.6,h));',
      'vec3 col=uLight>.5?mix(uBg,tint*.85,glow*.85):uBg+tint*glow*.95;',
      'col+=tint*.05*smoothstep(-.2,.8,h)*(uLight>.5?0.:1.);',
      'gl_FragColor=vec4(finish(col,uv),1.);}'
    ].join('\n'),

    // 4. MESH — soft drifting colour clouds (Stripe-style mesh gradient)
    mesh: [
      'vec3 blob(vec2 p,vec2 c,float r,vec3 col){float d=length(p-c);return col*exp(-d*d/(r*r));}',
      'void main(){vec2 uv=gl_FragCoord.xy/uRes;vec2 p=(uv-.5)*vec2(uRes.x/uRes.y,1.);',
      'float t=uTime*.12;p+=.06*vec2(snoise(p*1.4+t*.3),snoise(p*1.4-t*.3));',
      'vec3 g=vec3(0.);',
      'g+=blob(p,vec2(.55*sin(t*.7),.25*cos(t*.9)+.15),.42,uC1);',
      'g+=blob(p,vec2(.6*cos(t*.5+1.),.3*sin(t*.6)-.1),.38,uC2);',
      'g+=blob(p,vec2(.45*sin(t*.4+2.5),.35*cos(t*.8+1.)),.32,uC3);',
      'g+=blob(p,(uMouse-.5)*vec2(uRes.x/uRes.y,1.),.28,mix(uC2,uC1,.5))*.5;',
      'vec3 col=uLight>.5?mix(uBg,uBg*.55+g*.6,clamp(length(g),0.,1.)*.75):uBg+g*.62;',
      'gl_FragColor=vec4(finish(col,uv),1.);}'
    ].join('\n')
  };

  // anti-aliased contour line: exact with derivatives, approximate without
  function DERIV_LINE() {
    return derivatives
      ? 'float w=fwidth(x);float line=1.-smoothstep(w*.5,w*1.6,f);'
      : 'float line=1.-smoothstep(.02,.06,f);';
  }

  var program = null, loc = {}, style = '';

  function compile(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  function build(name) {
    var head = (name === 'contour' && derivatives) ? '#extension GL_OES_standard_derivatives : enable\n' : '';
    var vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, head + COMMON + '\n' + FRAG[name]);
    if (!vs || !fs) return false;
    var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(pr)); return false; }
    if (program) gl.deleteProgram(program);
    program = pr; gl.useProgram(pr);
    ['uRes', 'uTime', 'uMouse', 'uLight', 'uDim', 'uScroll', 'uC1', 'uC2', 'uC3', 'uBg'].forEach(function (n) { loc[n] = gl.getUniformLocation(pr, n); });
    var a = gl.getAttribLocation(pr, 'p');
    gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    style = name; colours(); resize(); return true;
  }

  var quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  function cssColour(name) {
    var probe = document.createElement('i'); probe.style.color = 'var(' + name + ')'; probe.style.display = 'none';
    document.body.appendChild(probe); var c = getComputedStyle(probe).color; probe.remove();
    var m = c.match(/[\d.]+/g) || [0, 0, 0]; return [m[0] / 255, m[1] / 255, m[2] / 255];
  }
  function colours() {
    if (!program) return;
    var light = document.documentElement.dataset.theme === 'light';
    gl.uniform3fv(loc.uC1, cssColour('--g1')); gl.uniform3fv(loc.uC2, cssColour('--g2'));
    gl.uniform3fv(loc.uC3, cssColour('--g3')); gl.uniform3fv(loc.uBg, cssColour('--bg'));
    gl.uniform1f(loc.uLight, light ? 1 : 0);
    if (!running) draw(performance.now());
  }
  function resize() {
    var r = canvas.getBoundingClientRect(), s = SCALE[style] || .5;
    var w = Math.max(2, Math.round(r.width * s)), h = Math.max(2, Math.round(r.height * s));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    if (program) gl.uniform2f(loc.uRes, w, h);
  }

  var mx = .5, my = .5, tx = .5, ty = .5;
  window.addEventListener('pointermove', function (e) { tx = e.clientX / innerWidth; ty = 1 - e.clientY / innerHeight; }, { passive: true });

  var hero = document.querySelector('.hero');
  var t0 = performance.now(), last = 0, running = false, visible = true;
  function draw(now) {
    mx += (tx - mx) * .05; my += (ty - my) * .05;
    gl.uniform1f(loc.uTime, (now - t0) / 1000 + 40);
    gl.uniform2f(loc.uMouse, mx, my);
    // full-page mode: the art eases down to ~45% strength once the hero has scrolled away
    var heroH = hero ? hero.offsetHeight : innerHeight, y = window.scrollY;
    var k = Math.min(Math.max((y - heroH * .25) / (heroH * .75), 0), 1);
    gl.uniform1f(loc.uDim, k * k * (3 - 2 * k) * .55);
    gl.uniform1f(loc.uScroll, y);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function loop(now) {
    if (!running) return;
    requestAnimationFrame(loop);
    if (now - last < FRAME_MS - 1) return;
    last = now; draw(now);
  }
  function sync() {
    var should = visible && !document.hidden && !reduced && !!program;
    if (should && !running) { running = true; last = 0; requestAnimationFrame(loop); }
    else if (!should) running = false;
  }

  new IntersectionObserver(function (es) { visible = es[0].isIntersecting; sync(); }).observe(canvas);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('resize', function () { resize(); if (!running && program) draw(performance.now()); });
  new MutationObserver(colours).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // public hook for the style switcher in preview mode
  window.GensolveBg = {
    set: function (name) {
      if (!FRAG[name]) return;
      canvas.dataset.style = name; build(name); canvas.classList.add('on'); draw(performance.now()); sync();
    }
  };
  window.GensolveBg.set(canvas.dataset.style || 'liquid');
})();
