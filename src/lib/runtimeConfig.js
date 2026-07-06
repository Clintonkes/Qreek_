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
  return readEnv('VITE_API_URL', '/api/v1');
}

export function getWebSocketBaseUrl() {
  return readEnv('VITE_WS_URL', '');
}
