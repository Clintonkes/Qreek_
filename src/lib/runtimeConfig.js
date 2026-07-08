const runtimeEnv = typeof window !== 'undefined' && window.__ENV__ ? window.__ENV__ : {};
const buildEnv = import.meta.env || {};

function readEnv(key, fallback = '') {
  if (runtimeEnv[key] !== undefined && runtimeEnv[key] !== null && runtimeEnv[key] !== '') {
    return runtimeEnv[key];
  }
  if (buildEnv[key] !== undefined && buildEnv[key] !== null && buildEnv[key] !== '') {
    return buildEnv[key];
  }
  return fallback;
}

export function getApiBaseUrl() {
  const raw = readEnv('VITE_API_URL', '/api/v1').trim();
  if (!raw) return '/api/v1';
  if (raw.endsWith('/api/v1')) return raw.replace(/\/+$/, '');
  if (raw.endsWith('/api/v1/')) return raw.replace(/\/+$/, '');
  if (raw.endsWith('/api')) return `${raw.replace(/\/+$/, '')}/v1`;
  if (raw.includes('/api/v1')) return raw.replace(/\/+$/, '');
  return `${raw.replace(/\/+$/, '')}/api/v1`;
}

export function getWebSocketBaseUrl() {
  return readEnv('VITE_WS_URL', '').trim();
}
