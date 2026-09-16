import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SokoApiClient } from './index';

describe('@soko/api-client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('attaches Bearer token and Device UUID headers when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { token: 'mock-token', user: { id: 'u-1' } } }),
    });
    globalThis.fetch = fetchMock;

    const client = new SokoApiClient({
      baseUrl: 'http://localhost:8000',
      getToken: () => 'test-bearer-token',
      getDeviceId: () => 'dev-uuid-1234',
    });

    await client.login({ email: 'test@soko.africa', password: 'password' });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:8000/api/v1/auth/login');
    expect(options.headers['Authorization']).toBe('Bearer test-bearer-token');
    expect(options.headers['X-Device-UUID']).toBe('dev-uuid-1234');
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('throws descriptive error on non-200 response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ message: 'Validation failed: Invalid phone number' }),
    });
    globalThis.fetch = fetchMock;

    const client = new SokoApiClient({
      baseUrl: 'http://localhost:8000',
    });

    await expect(client.createSale({})).rejects.toThrow('Validation failed: Invalid phone number');
  });
});
