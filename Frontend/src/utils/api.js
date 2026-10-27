/**
 * Netrium API Endpoint Resolver & Safe Response Parser
 * Automatically normalizes backend URLs regardless of formatting:
 * - Adds https:// if protocol is omitted
 * - Strips trailing slashes
 * - Strips accidental duplicate '/api' suffix (e.g. netrium-site.vercel.app/api)
 * - Auto-corrects common typo 'netrium-side' -> 'netrium-site'
 */
export function getApiUrl(endpoint = '') {
  let base = (import.meta.env.VITE_BACKEND_URL || '').trim();

  // If no backend URL is set, default to localhost in dev, or relative path in prod
  if (!base) {
    base = import.meta.env.DEV ? 'http://localhost:5000' : '';
  }

  if (base) {
    // Add protocol if user omitted it
    if (!base.startsWith('http://') && !base.startsWith('https://')) {
      base = `https://${base}`;
    }

    // Auto-correct common domain typo 'netrium-side.vercel.app' -> 'netrium-site.vercel.app'
    base = base.replace(/netrium-side\.vercel\.app/i, 'netrium-site.vercel.app');

    // Strip trailing slashes
    base = base.replace(/\/+$/, '');

    // Strip trailing '/api' so endpoint paths like '/api/ai/chat' never duplicate to '/api/api/ai/chat'
    base = base.replace(/\/api$/i, '');
  }

  // Ensure clean endpoint starting with '/'
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  return `${base}${cleanEndpoint}`;
}

/**
 * Safely parses response JSON. If response is HTML or plain text (e.g. 404 / 502 / Vercel error),
 * throws a clean, descriptive error message rather than a confusing SyntaxError.
 */
export async function safeJsonParse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    const snippet = text.slice(0, 150).replace(/\s+/g, ' ').trim();
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}: ${snippet || response.statusText}`);
    }
    throw new Error(`Invalid JSON response: ${snippet}`);
  }
}

export default getApiUrl;
