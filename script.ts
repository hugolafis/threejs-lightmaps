import './style.css';
import * as THREE from 'three';
import { Viewer } from './src/classes/viewer';

// Canvas
const canvas = document.querySelector<HTMLCanvasElement>('canvas.webgl');
const clock = new THREE.Clock();

// Input
const exposure = document.getElementById('exposureControl') as HTMLInputElement;
const abledoControl = document.getElementById(
  'albedoControl'
) as HTMLInputElement;
const lightmapControl = document.getElementById(
  'lightmapControl'
) as HTMLInputElement;

/**
 * Renderer
 */
THREE.ColorManagement.legacyMode = false;
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = 0.75;

const viewer = new Viewer(renderer, canvas);
const resizeObserver = new ResizeObserver(viewer.resize);
resizeObserver.observe(canvas);

function init() {
  clock.start();

  exposure.addEventListener('input', ev => {
    renderer.toneMappingExposure = Number(
      (ev.target as HTMLInputElement).value
    );
  });

  lightmapControl.addEventListener('click', () => {
    const state = lightmapControl.checked;

    viewer.toggleLightmap(state);
  });

  abledoControl.addEventListener('click', () => {
    const state = abledoControl.checked;

    viewer.toggleAlbedo(state);
  });

  update();
}

function update() {
  // Calculate delta
  const delta = clock.getDelta();

  // Update the viewer
  viewer.update(delta);

  window.requestAnimationFrame(update);
}

init();
