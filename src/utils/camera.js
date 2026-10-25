/**
 * Camera Security Snapshot Utility
 * Silently requests camera snapshot frame to attach to Telegram security alerts.
 * Gracefully handles permission denial or missing cameras without throwing.
 */

export async function captureSecuritySnapshot(timeoutMs = 3500) {
  if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return null;
  }

  return new Promise((resolve) => {
    let stream = null;
    let timer = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      if (stream) {
        try {
          stream.getTracks().forEach(track => track.stop());
        } catch {}
      }
    };

    timer = setTimeout(() => {
      cleanup();
      resolve(null);
    }, timeoutMs);

    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
        width: { ideal: 640 },
        height: { ideal: 480 }
      },
      audio: false
    })
      .then((mediaStream) => {
        stream = mediaStream;
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.srcObject = stream;

        video.onloadedmetadata = () => {
          video.play().then(() => {
            // Short 300ms delay to let camera auto-exposure settle
            setTimeout(() => {
              try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth || 640;
                canvas.height = video.videoHeight || 480;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
                cleanup();
                resolve(dataUrl);
              } catch (err) {
                cleanup();
                resolve(null);
              }
            }, 300);
          }).catch(() => {
            cleanup();
            resolve(null);
          });
        };
      })
      .catch(() => {
        cleanup();
        resolve(null);
      });
  });
}
