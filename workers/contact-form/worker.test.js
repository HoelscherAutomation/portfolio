import { describe, it, expect, vi, beforeEach } from 'vitest';
import worker from './index.js';

const env = {
  RESEND_API_KEY: 'test-key',
  FROM_EMAIL: 'from@test',
  TO_EMAIL: 'to@test',
  ALLOWED_ORIGIN: 'https://hoelscherautomation.com',
};

function post(body) {
  return new Request('https://api.test/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const familyBody = {
  type: 'family',
  name: 'Pat Parent',
  email: 'pat@example.com',
  childName: 'Sam',
  childAge: 7,
  theme: 'Dragons & castles',
  length: 'About 1 minute ($99)',
  favoriteColor: 'teal',
  special: 'our dog Biscuit',
  notes: 'birthday is in September',
};

describe('family intake branch', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
  });

  it('accepts a valid family submission and emails it', async () => {
    const res = await worker.fetch(post(familyBody), env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    const call = globalThis.fetch.mock.calls[0];
    expect(call[0]).toBe('https://api.resend.com/emails');
    const sent = JSON.parse(call[1].body);
    expect(sent.subject).toBe('Family video request: Pat Parent, Dragons & castles');
    expect(sent.reply_to).toBe('pat@example.com');
    expect(sent.text).toContain('Child: Sam, age 7');
    expect(sent.text).toContain('Favorite color: teal');
    expect(sent.text).toContain('our dog Biscuit');
  });

  it('rejects a missing required field', async () => {
    const res = await worker.fetch(post({ ...familyBody, childName: '' }), env);
    expect(res.status).toBe(400);
  });

  it('rejects an unknown theme', async () => {
    const res = await worker.fetch(post({ ...familyBody, theme: 'Hogwarts' }), env);
    expect(res.status).toBe(400);
  });

  it('rejects an out-of-range age', async () => {
    const res = await worker.fetch(post({ ...familyBody, childAge: 30 }), env);
    expect(res.status).toBe(400);
  });

  it('leaves the contact path working unchanged', async () => {
    const res = await worker.fetch(
      post({ name: 'A', email: 'a@b.co', message: 'hi' }), env);
    expect(res.status).toBe(200);
    const sent = JSON.parse(globalThis.fetch.mock.calls[0][1].body);
    expect(sent.subject).toBe('Hoelscher Automation contact: A');
  });
});
