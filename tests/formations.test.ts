import { describe, it, expect } from 'vitest';
import { makeFormation, progressAt, type TimelinePoint } from '../src/scripts/formations';

const NAMES = ['scattered', 'grid', 'lattice', 'network'] as const;

describe('makeFormation', () => {
  it('returns count*3 floats for every formation', () => {
    for (const name of NAMES) {
      expect(makeFormation(name, 100)).toHaveLength(300);
    }
  });

  it('is deterministic given a seeded rand', () => {
    let s = 42;
    const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    let s2 = 42;
    const rand2 = () => ((s2 = (s2 * 16807) % 2147483647) / 2147483647);
    expect(makeFormation('scattered', 50, rand)).toEqual(makeFormation('scattered', 50, rand2));
  });

  it('grid is flat (z = 0) and centered near the origin', () => {
    const a = makeFormation('grid', 100);
    let sumX = 0;
    for (let i = 0; i < 100; i++) {
      expect(a[i * 3 + 2]).toBe(0);
      sumX += a[i * 3];
    }
    expect(Math.abs(sumX / 100)).toBeLessThan(0.5);
  });

  it('network points sit on shells of radius 2.6 or 3.3', () => {
    const a = makeFormation('network', 70);
    for (let i = 0; i < 70; i++) {
      const r = Math.hypot(a[i * 3], a[i * 3 + 1], a[i * 3 + 2]);
      const onShell = Math.abs(r - 2.6) < 1e-6 || Math.abs(r - 3.3) < 1e-6;
      expect(onShell).toBe(true);
    }
  });
});

describe('progressAt', () => {
  const timeline: TimelinePoint[] = [
    { anchor: 0, formation: 'scattered' },
    { anchor: 1000, formation: 'grid' },
    { anchor: 2000, formation: 'lattice' },
    { anchor: 3000, formation: 'network' },
  ];

  it('clamps before the first anchor', () => {
    expect(progressAt(-50, timeline)).toEqual({ from: 'scattered', to: 'scattered', mix: 0, t: 0 });
  });

  it('clamps after the last anchor', () => {
    expect(progressAt(9999, timeline)).toEqual({ from: 'network', to: 'network', mix: 1, t: 1 });
  });

  it('midpoint of a segment eases to 0.5 with correct neighbors', () => {
    const p = progressAt(1500, timeline);
    expect(p.from).toBe('grid');
    expect(p.to).toBe('lattice');
    expect(p.mix).toBeCloseTo(0.5, 5);
    expect(p.t).toBeCloseTo(0.5, 5);
  });

  it('mix is monotonic within a segment', () => {
    const mixes = [1100, 1300, 1500, 1700, 1900].map((y) => progressAt(y, timeline).mix);
    for (let i = 1; i < mixes.length; i++) expect(mixes[i]).toBeGreaterThan(mixes[i - 1]);
  });

  it('throws on an empty timeline', () => {
    expect(() => progressAt(0, [])).toThrow();
  });

  it('treats a zero-height segment (duplicate anchors) as instantly complete, never NaN', () => {
    // grid and lattice share anchor 1000 (a zero-height or stacked section).
    // The scan walks i forward while points[i+1].anchor < scrollCenter, so it
    // always lands on a segment where points[i].anchor < scrollCenter <=
    // points[i+1].anchor -- which structurally skips straight over the
    // zero-span (grid, lattice) pair rather than selecting it. Both sides of
    // the shared anchor must still resolve to finite, sane progress.
    const stacked: TimelinePoint[] = [
      { anchor: 0, formation: 'scattered' },
      { anchor: 1000, formation: 'grid' },
      { anchor: 1000, formation: 'lattice' },
      { anchor: 2000, formation: 'network' },
    ];

    const at = progressAt(1000, stacked);
    expect(Number.isFinite(at.mix)).toBe(true);
    expect(Number.isFinite(at.t)).toBe(true);
    expect(at.from).toBe('scattered');
    expect(at.to).toBe('grid');
    expect(at.mix).toBe(1);

    const justPast = progressAt(1000.001, stacked);
    expect(Number.isFinite(justPast.mix)).toBe(true);
    expect(Number.isFinite(justPast.t)).toBe(true);
    expect(justPast.from).toBe('lattice');
    expect(justPast.to).toBe('network');
  });

  it('never divides by a zero-width segment even at the shared anchor boundary', () => {
    // Direct regression for the (scrollCenter - a) / (b - a) division: with a
    // three-way stack (two consecutive zero-span segments), every scan point
    // across the whole range must stay finite.
    const stacked: TimelinePoint[] = [
      { anchor: 0, formation: 'scattered' },
      { anchor: 500, formation: 'grid' },
      { anchor: 500, formation: 'lattice' },
      { anchor: 500, formation: 'network' },
      { anchor: 1000, formation: 'grid' },
    ];
    for (let s = -100; s <= 1100; s += 25) {
      const p = progressAt(s, stacked);
      expect(Number.isFinite(p.mix)).toBe(true);
      expect(Number.isFinite(p.t)).toBe(true);
    }
  });
});
