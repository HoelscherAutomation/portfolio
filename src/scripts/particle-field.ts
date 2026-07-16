import * as THREE from 'three';
import {
  makeFormation,
  progressAt,
  type FormationName,
  type TimelinePoint,
} from './formations';

const COLOR_FROM = 0x4d8df5; // brand blue
const COLOR_TO = 0xe58e26; // brand orange
const BG = 0x0a0e1a; // bg-deep

/**
 * Boots the particle field inside `container`. Progressive enhancement only:
 * any failure removes the container and leaves the page untouched.
 */
export function initParticleField(container: HTMLElement): void {
  try {
    start(container);
  } catch {
    container.remove();
  }
}

function start(container: HTMLElement): void {
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'));
  if (sections.length < 2) {
    container.remove();
    return;
  }

  const small = matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const count = small ? 100 : 1300;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.0 : 2));
  renderer.setSize(innerWidth, innerHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(BG, 7, 14);
  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 100);
  camera.position.z = 8;

  const cache = new Map<FormationName, Float32Array>();
  const formationFor = (name: FormationName): Float32Array => {
    let f = cache.get(name);
    if (!f) {
      f = makeFormation(name, count);
      cache.set(name, f);
    }
    return f;
  };

  const firstScene = sections[0].dataset.scene as FormationName;
  const positions = new Float32Array(formationFor(firstScene));
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: COLOR_FROM,
    size: 0.04,
    transparent: true,
    opacity: 0.45,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  const colFrom = new THREE.Color(COLOR_FROM);
  const colTo = new THREE.Color(COLOR_TO);

  let timeline: TimelinePoint[] = [];
  const measure = (): void => {
    timeline = sections.map((el) => {
      const top = el.getBoundingClientRect().top + scrollY;
      return {
        anchor: top + Math.min(el.offsetHeight, innerHeight) / 2,
        formation: el.dataset.scene as FormationName,
      };
    });
  };
  measure();

  let smooth = scrollY + innerHeight / 2;
  let raf = 0;
  const clock = new THREE.Clock();

  const frame = (): void => {
    raf = requestAnimationFrame(frame);
    const target = scrollY + innerHeight / 2;
    smooth = reduceMotion.matches ? target : smooth + (target - smooth) * 0.07;
    const p = progressAt(smooth, timeline);
    const from = formationFor(p.from);
    const to = formationFor(p.to);
    for (let i = 0; i < positions.length; i++) {
      positions[i] = from[i] + (to[i] - from[i]) * p.mix;
    }
    geometry.attributes.position.needsUpdate = true;
    material.color.copy(colFrom).lerp(colTo, p.t);
    const t = clock.getElapsedTime();
    if (reduceMotion.matches) {
      points.rotation.y = p.t * 0.35;
      points.rotation.x = 0;
    } else {
      points.rotation.y = t * 0.02 + p.t * 0.35;
      points.rotation.x = Math.sin(t * 0.15) * 0.03;
    }
    renderer.render(scene, camera);
  };

  const startLoop = (): void => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  const stopLoop = (): void => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const onVisibilityChange = (): void => {
    if (document.hidden) stopLoop();
    else startLoop();
  };

  const onResize = (): void => {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    measure();
  };

  const teardown = (): void => {
    stopLoop();
    document.removeEventListener('visibilitychange', onVisibilityChange);
    removeEventListener('resize', onResize);
    renderer.dispose();
    container.remove();
  };

  const onContextLost = (): void => {
    teardown();
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  addEventListener('resize', onResize);
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);

  startLoop();
}
