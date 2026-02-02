const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * The backend returns paths like "/static/results/abc.png".
 * During dev the frontend runs on :5173 but FastAPI runs on :8000,
 * so the browser resolves that relative path against the WRONG origin.
 *
 * This helper turns any relative path into a full absolute URL
 * pointing at the FastAPI server.  Already-absolute URLs are left alone.
 */
function resolveUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return BASE_URL + url;   // e.g. "http://localhost:8000" + "/static/results/abc.png"
}

/**
 * POST /api/colorize
 *
 * @param {File} imageFile
 * @param {(percent: number) => void} onProgress  0-100
 * @returns {Promise<{ resultUrl: string }>}       resultUrl guaranteed absolute
 */
export function colorizeImage(imageFile, onProgress) {
  const formData = new FormData();
  formData.append('image', imageFile);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE_URL}/api/colorize`, true);

    xhr.upload.addEventListener('progress', (ev) => {
      if (ev.lengthComputable && onProgress) {
        onProgress(Math.round((ev.loaded / ev.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          data.resultUrl = resolveUrl(data.resultUrl);  // ← fix applied here
          resolve(data);
        } catch {
          reject(new Error('Invalid JSON from /api/colorize'));
        }
      } else {
        let msg = `Server error ${xhr.status}`;
        try {
          const body = JSON.parse(xhr.responseText);
          if (body.error || body.message) msg = body.error || body.message;
        } catch { /* ignore */ }
        reject(new Error(msg));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error — check your connection or API URL.'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled.'));
    });

    xhr.send(formData);
  });
}

/**
 * GET /api/history
 *
 * @returns {Promise<Array<{ id, filename, createdAt, resultUrl }>>}
 *          every resultUrl resolved to absolute
 */
export async function fetchHistory() {
  const res = await fetch(`${BASE_URL}/api/history`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    let msg = `Failed to load history (${res.status})`;
    try {
      const body = await res.json();
      if (body.error || body.message) msg = body.error || body.message;
    } catch { /* ignore */ }
    throw new Error(msg);
  }

  const items = await res.json();

  // resolve every item's resultUrl so history thumbnails load too
  return items.map((item) => ({
    ...item,
    resultUrl: resolveUrl(item.resultUrl),
  }));
}