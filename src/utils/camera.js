/**
 * Robust Cross-Platform Camera Security Snapshot Utility
 * Compatible with Windows, Mac, iOS Safari, Android Chrome, and tablets.
 * Supports progressive constraint fallbacks, DOM attachment for WebKit, and permission caching.
 */

/**
 * Checks current browser camera permission status ('granted' | 'prompt' | 'denied' | 'unknown')
 */
export async function checkCameraPermissionStatus() {
  if (typeof navigator === 'undefined' || !navigator.permissions || !navigator.permissions.query) {
    return 'unknown';
  }
  try {
    const status = await navigator.permissions.query({ name: 'camera' });
    return status.state; // 'granted', 'prompt', 'denied'
  } catch {
    return 'unknown';
  }
}

/**
 * Helper to obtain media stream with progressive constraint fallbacks
 * (prevents OverconstrainedError on older Android/iOS devices)
 */
async function getMediaStreamWithFallback() {
  const constraintOptions = [
    { video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false },
    { video: { facingMode: 'user' }, audio: false },
    { video: { facingMode: { ideal: 'user' } }, audio: false },
    { video: true, audio: false }
  ];

  for (const constraints of constraintOptions) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (stream) return stream;
    } catch (err) {
      // If permission explicitly denied, stop trying immediately
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw err;
      }
      // Otherwise continue to next constraint fallback
    }
  }

  throw new Error('Could not initialize video stream with available constraints');
}

/**
 * Captures an instantaneous snapshot from front camera / webcam.
 * Safely attaches hidden video element to DOM so iOS WebKit starts rendering frames.
 * Returns base64 JPEG data URL or null on failure/denial.
 */
export async function captureSecuritySnapshot(timeoutMs = 6000) {
  if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return null;
  }

  return new Promise((resolve) => {
    let stream = null;
    let videoEl = null;
    let timer = null;
    let resolved = false;

    const cleanup = () => {
      if (resolved) return;
      resolved = true;
      if (timer) clearTimeout(timer);
      if (stream) {
        try {
          stream.getTracks().forEach(track => {
            track.stop();
            track.enabled = false;
          });
        } catch {}
      }
      if (videoEl && videoEl.parentNode) {
        try {
          videoEl.pause();
          videoEl.srcObject = null;
          videoEl.parentNode.removeChild(videoEl);
        } catch {}
      }
    };

    // Safety timeout
    timer = setTimeout(() => {
      cleanup();
      resolve(null);
    }, timeoutMs);

    getMediaStreamWithFallback()
      .then((mediaStream) => {
        stream = mediaStream;

        // Create invisible video element in DOM for iOS Safari / Android Chrome rendering
        videoEl = document.createElement('video');
        videoEl.setAttribute('autoplay', 'true');
        videoEl.setAttribute('muted', 'true');
        videoEl.setAttribute('playsinline', 'true');
        videoEl.setAttribute('webkit-playsinline', 'true');
        videoEl.style.position = 'fixed';
        videoEl.style.top = '-9999px';
        videoEl.style.left = '-9999px';
        videoEl.style.width = '1px';
        videoEl.style.height = '1px';
        videoEl.style.opacity = '0';
        videoEl.style.pointerEvents = 'none';
        videoEl.muted = true;
        videoEl.playsInline = true;
        document.body.appendChild(videoEl);

        videoEl.srcObject = stream;

        const takeFrame = () => {
          setTimeout(() => {
            try {
              const canvas = document.createElement('canvas');
              const w = videoEl.videoWidth || 640;
              const h = videoEl.videoHeight || 480;
              canvas.width = w;
              canvas.height = h;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(videoEl, 0, 0, w, h);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
              cleanup();
              resolve(dataUrl);
            } catch {
              cleanup();
              resolve(null);
            }
          }, 350); // Sensor auto-exposure pause
        };

        videoEl.onplaying = takeFrame;
        videoEl.onloadedmetadata = () => {
          videoEl.play().catch(() => takeFrame());
        };

        // Fallback frame trigger if events don't fire quickly
        setTimeout(() => {
          if (!resolved) {
            takeFrame();
          }
        }, 1200);
      })
      .catch(() => {
        cleanup();
        resolve(null);
      });
  });
}
