import { getBackendApiBaseUrl, getBackendServerBaseUrl } from '@/backend/shared';

describe('backend/shared', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.BACKEND_INTERNAL_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('returns default public API URL when NEXT_PUBLIC_API_URL is missing', () => {
    expect(getBackendApiBaseUrl()).toBe('http://localhost:8000');
  });

  it('returns NEXT_PUBLIC_API_URL for public API base URL', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://public-api.example.com';

    expect(getBackendApiBaseUrl()).toBe('https://public-api.example.com');
  });

  it('prefers BACKEND_INTERNAL_URL for server base URL', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://public-api.example.com';
    process.env.BACKEND_INTERNAL_URL = 'http://backend-internal:8000';

    expect(getBackendServerBaseUrl()).toBe('http://backend-internal:8000');
  });

  it('falls back to NEXT_PUBLIC_API_URL then default for server base URL', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://public-api.example.com';

    expect(getBackendServerBaseUrl()).toBe('https://public-api.example.com');

    delete process.env.NEXT_PUBLIC_API_URL;
    expect(getBackendServerBaseUrl()).toBe('http://localhost:8000');
  });
});
