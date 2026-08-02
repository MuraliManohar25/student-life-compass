import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeApiBaseUrl, resolveApiBaseUrl } from './api';

describe('API base URL configuration', () => {
  it('normalizes a bare hostname into an absolute URL with protocol', () => {
    assert.equal(normalizeApiBaseUrl('localhost:8000'), 'http://localhost:8000/api');
  });

  it('prefers configured production URL and rejects relative values', () => {
    const base = resolveApiBaseUrl({
      env: { VITE_API_URL: 'https://api.example.com', MODE: 'production' },
      hostname: 'example.com'
    } as any);

    assert.equal(base, 'https://api.example.com/api');
  });

  it('falls back to localhost in development when no env is provided', () => {
    const base = resolveApiBaseUrl({
      env: {},
      hostname: 'localhost',
      protocol: 'http:'
    } as any);

    assert.equal(base, 'http://localhost:8000/api');
  });
});
