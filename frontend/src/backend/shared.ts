const DEFAULT_PUBLIC_API_URL = 'http://localhost:8000';
const DEFAULT_INTERNAL_API_URL = 'http://localhost:8000';

export function getBackendApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_PUBLIC_API_URL;
}

export function getBackendServerBaseUrl(): string {
  return (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_INTERNAL_API_URL
  );
}
