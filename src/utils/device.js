/**
 * Device Fingerprinting and Identity Helper
 * Generates and persists a unique device identifier and readable device name.
 */

const STORAGE_KEY = 'dyzz_device_id';

/**
 * Returns a persistent, unique device identifier for this browser/device.
 * Stored in localStorage across sessions.
 */
export function getDeviceId() {
  if (typeof window === 'undefined') return 'dev_server_side';

  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      const rand = Math.random().toString(36).substring(2, 10);
      const ts = Date.now().toString(36);
      id = `dev_${rand}_${ts}`;
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return 'dev_ephemeral_' + Math.random().toString(36).substring(2, 8);
  }
}

/**
 * Returns a human-friendly device name (e.g., "Windows PC • Chrome", "iPhone • Safari").
 */
export function getDeviceName() {
  if (typeof window === 'undefined') return 'Unknown Device';

  const ua = navigator.userAgent || '';
  let os = 'Unknown OS';

  if (ua.includes('Win')) os = 'Windows PC';
  else if (ua.includes('iPhone')) os = 'iPhone (iOS)';
  else if (ua.includes('iPad')) os = 'iPad (iPadOS)';
  else if (ua.includes('Android')) os = 'Android Phone';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'Mac';
  else if (ua.includes('Linux')) os = 'Linux PC';

  let browser = 'Browser';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';

  return `${os} - ${browser}`;
}

/**
 * Returns common device headers to attach to API requests.
 * Strictly guarantees pure ASCII values to comply with HTTP/Fetch ByteString standard (RFC 7230).
 */
export function getDeviceHeaders() {
  const rawName = getDeviceName();
  const safeName = rawName.replace(/[^\x20-\x7E]/g, '-').trim();
  const rawId = getDeviceId();
  const safeId = rawId.replace(/[^\x20-\x7E]/g, '').trim();

  return {
    'X-Device-Id': safeId,
    'X-Device-Name': safeName
  };
}
