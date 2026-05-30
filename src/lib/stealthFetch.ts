export async function stealthFetch(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has('User-Agent')) {
    headers.set(
      'User-Agent',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
  }
  return fetch(url, { ...options, headers });
}
