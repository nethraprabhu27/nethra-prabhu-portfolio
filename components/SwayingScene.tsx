"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

// The hero's desk-scene background, drawn through a WebGL shader so the plants sway when a gust of
// wind passes through every few seconds. A greyscale mask marks the foliage (and how much each plant
// moves); everything else stays still. Falls back to the still picture (the CSS background) if
// WebGL isn't available or motion is reduced.
const SCENE_SRC = "/art/hero-desk-scene.webp";
const MASK_SRC = "/art/hero-plants-mask.png";
// Matches the CSS background-position: cover-fit, centred across, 62% down.
const FOCUS_Y = 0.62;

const VERTEX = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAGMENT = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uImage;
uniform sampler2D uMask;
uniform vec2 uView;       // canvas size (px)
uniform vec2 uImageSize;  // picture size (px)
uniform float uScale;     // canvas px per picture px
uniform float uTime;

const float EVERY = 5.0;  // seconds between gusts
const float GUST = 2.6;   // seconds a gust takes to blow through and settle
const float SWEEP = 0.7;  // seconds for the gust to cross the picture, left to right

// Strength of the wind at picture position x (0-1) and time t: a swell and a little flutter, then a
// damped settle as the leaves spring back.
float wind(float x, float t) {
  float p = mod(t - x * SWEEP, EVERY);
  if (p > GUST) return 0.0;
  float swell = sin(3.14159 * min(p / 1.1, 1.0));
  float settle = exp(-2.2 * max(p - 0.55, 0.0)) * cos(6.0 * max(p - 0.55, 0.0));
  return mix(swell, settle, smoothstep(0.35, 0.75, p));
}

void main() {
  vec2 px = vec2(vUv.x, 1.0 - vUv.y) * uView;
  vec2 shown = uImageSize * uScale;
  vec2 origin = vec2((uView.x - shown.x) * 0.5, (uView.y - shown.y) * ${FOCUS_Y.toFixed(2)});
  vec2 uv = (px - origin) / shown;

  float m = texture2D(uMask, uv).r;
  float w = wind(uv.x, uTime);
  // Leaves bend downwind and dip a touch; a faster flutter breaks up the motion leaf by leaf.
  float flutter = sin(uv.y * 90.0 + uv.x * 40.0 + uTime * 11.0) * 0.35;
  vec2 bend = vec2(9.0 * w + 2.2 * flutter * abs(w), 2.5 * abs(w)) * m;
  vec2 src = uv - bend / shown;
  gl_FragColor = vec4(texture2D(uImage, clamp(src, 0.0, 1.0)).rgb, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

function upload(gl: WebGLRenderingContext, unit: number, img: HTMLImageElement) {
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
}

export default function SwayingScene({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduceMotion) return;
    const gl = canvas.getContext("webgl", { antialias: false });
    if (!gl) return;
    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const u = (name: string) => gl.getUniformLocation(program, name);
    gl.uniform1i(u("uImage"), 0);
    gl.uniform1i(u("uMask"), 1);

    let frame = 0;
    let disposed = false;
    let visible = true;
    let imageSize = { w: 1, h: 1 };
    const start = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u("uView"), canvas.width, canvas.height);
      gl.uniform1f(u("uScale"), Math.max(canvas.width / imageSize.w, canvas.height / imageSize.h));
    };
    const draw = (now: number) => {
      gl.uniform1f(u("uTime"), (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (visible) frame = requestAnimationFrame(draw);
    };

    const load = (src: string) => { const img = new Image(); img.src = src; return img.decode().then(() => img); };
    const observer = new ResizeObserver(resize);
    // Only animate while the hero is on screen.
    const seen = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting;
      if (visible && !was && !disposed) frame = requestAnimationFrame(draw);
    });
    Promise.all([load(SCENE_SRC), load(MASK_SRC)]).then(([scene, mask]) => {
      if (disposed) return;
      upload(gl, 0, scene);
      upload(gl, 1, mask);
      imageSize = { w: scene.naturalWidth, h: scene.naturalHeight };
      gl.uniform2f(u("uImageSize"), imageSize.w, imageSize.h);
      observer.observe(canvas);
      seen.observe(canvas);
      resize();
      canvas.classList.add("is-live");
      frame = requestAnimationFrame(draw);
    }).catch(() => {});

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      seen.disconnect();
    };
  }, [reduceMotion]);

  return (
    <div className={className} aria-hidden="true">
      <canvas ref={canvasRef} className="hero-scene-canvas" />
    </div>
  );
}
