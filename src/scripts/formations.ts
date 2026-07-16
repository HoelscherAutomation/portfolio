export type FormationName = 'scattered' | 'grid' | 'lattice' | 'network';

export interface TimelinePoint {
  /** Document-Y pixel position where this formation is fully assembled. */
  anchor: number;
  formation: FormationName;
}

export interface Progress {
  from: FormationName;
  to: FormationName;
  /** Eased 0..1 blend between `from` and `to`. */
  mix: number;
  /** Overall 0..1 journey progress, used for the blue-to-orange color lerp. */
  t: number;
}

const smoothstep = (x: number): number => x * x * (3 - 2 * x);

export function makeFormation(
  name: FormationName,
  count: number,
  rand: () => number = Math.random,
): Float32Array {
  const a = new Float32Array(count * 3);
  if (name === 'scattered') {
    for (let i = 0; i < count; i++) {
      a[i * 3] = (rand() - 0.5) * 16;
      a[i * 3 + 1] = (rand() - 0.5) * 10;
      a[i * 3 + 2] = (rand() - 0.5) * 8;
    }
  } else if (name === 'grid') {
    const cols = Math.ceil(Math.sqrt(count * 1.6));
    const rows = Math.ceil(count / cols);
    for (let i = 0; i < count; i++) {
      a[i * 3] = ((i % cols) - (cols - 1) / 2) * 0.24;
      a[i * 3 + 1] = (Math.floor(i / cols) - (rows - 1) / 2) * 0.24;
      a[i * 3 + 2] = 0;
    }
  } else if (name === 'lattice') {
    const n = Math.ceil(Math.cbrt(count));
    for (let i = 0; i < count; i++) {
      a[i * 3] = ((i % n) - (n - 1) / 2) * 0.42;
      a[i * 3 + 1] = ((Math.floor(i / n) % n) - (n - 1) / 2) * 0.42;
      a[i * 3 + 2] = (Math.floor(i / (n * n)) - (n - 1) / 2) * 0.42;
    }
  } else {
    // network: points on two spherical shells (every 7th point on the outer one)
    for (let i = 0; i < count; i++) {
      let x = rand() * 2 - 1;
      let y = rand() * 2 - 1;
      let z = rand() * 2 - 1;
      const len = Math.hypot(x, y, z) || 1;
      const r = i % 7 === 0 ? 3.3 : 2.6;
      a[i * 3] = (x / len) * r;
      a[i * 3 + 1] = (y / len) * r;
      a[i * 3 + 2] = (z / len) * r;
    }
  }
  return a;
}

export function progressAt(scrollCenter: number, points: TimelinePoint[]): Progress {
  if (points.length === 0) throw new Error('progressAt: empty timeline');
  const first = points[0];
  const last = points[points.length - 1];
  if (points.length === 1 || scrollCenter <= first.anchor) {
    return { from: first.formation, to: first.formation, mix: 0, t: 0 };
  }
  if (scrollCenter >= last.anchor) {
    return { from: last.formation, to: last.formation, mix: 1, t: 1 };
  }
  let i = 0;
  while (points[i + 1].anchor < scrollCenter) i++;
  const seg = (scrollCenter - points[i].anchor) / (points[i + 1].anchor - points[i].anchor);
  return {
    from: points[i].formation,
    to: points[i + 1].formation,
    mix: smoothstep(seg),
    t: (i + seg) / (points.length - 1),
  };
}
