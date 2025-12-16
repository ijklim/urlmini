/**
 * UrlShortener
 * - Lightweight in-memory shortener (for example/demo only)
 * - Each instance keeps its own mappings; production should use a persistent store.
 */
// Shared in-memory mappings for the app (demo only). For production use a persistent store.
const urlMappings = [];

export default class UrlShortener {
  constructor(req) {
    this.req = req;
  }

  /**
   * Validate and create a short URL mapping.
   * Returns an object with either `original_url` and `short_url` or an `error`.
   */
  generateUrl(urlToShorten) {
    if (!urlToShorten || urlToShorten.length === 0) return { error: 'Url missing' };

    // Basic validation: must start with http:// or https://
    const urlRegex = /^https?:\/\//i;
    if (!urlRegex.test(urlToShorten)) return { error: 'Invalid url' };

    urlMappings.push(urlToShorten);

    const id = urlMappings.length - 1;
    const protocol = this.req && this.req.secure ? 'https' : 'http';

    // Prefer the Host header which may include the port. If missing or does not include a port,
    // fall back to the socket's localPort to ensure the short_url includes the port when present.
    // Prefer express's req.get('host') which reads the Host header; fall back to headers/hostname.
    const hostHeader = this.req && typeof this.req.get === 'function' ? this.req.get('host') : (this.req && this.req.headers && this.req.headers.host);
    let host = hostHeader || (this.req && this.req.hostname) || 'localhost';
    // If host looks like an IPv6 address (contains ':' but no port), don't append port incorrectly.
    const hasPort = host && host.match(/:\d+$/);
    if (host && !hasPort) {
      const port = (this.req && this.req.socket && this.req.socket.localPort) || process.env.PORT;
      if (port) host = `${host}:${port}`;
    }

    return {
      id,
      original_url: urlToShorten
    };
  }

  /**
   * Look up original URL by numeric id.
   * `id` may be a string; this method coerces and validates it.
   */
  getOriginalUrl(id) {
    const idx = Number(id);
    if (!Number.isInteger(idx) || idx < 0) return { error: 'Invalid id' };
    const original = urlMappings[idx];
    if (original) return { original_url: original };
    return { error: 'Url is not in the database' };
  }

  /**
   * Return all mappings as an array of { id, original_url, short_url }.
   * short_url is built from the provided request so the host/port are correct.
   */
  getAllMappings() {
    const req = this.req || {};
    const protocol = req.secure ? 'https' : 'http';
    const hostHeader = req && typeof req.get === 'function' ? req.get('host') : (req.headers && req.headers.host);
    let host = hostHeader || req.hostname || 'localhost';
    const hasPort = host && host.match(/:\d+$/);
    if (host && !hasPort) {
      const port = (req.socket && req.socket.localPort) || process.env.PORT;
      if (port) host = `${host}:${port}`;
    }

    return urlMappings.map((original, idx) => ({
      id: idx,
      original_url: original,
      short_url: `${protocol}://${host}/${idx}`
    }));
  }
}