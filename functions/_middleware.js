export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Direct clean URL handling for /homepage2
  if (url.pathname === '/homepage2' || url.pathname === '/homepage2/') {
    const assetUrl = new URL(url);
    assetUrl.pathname = '/homepage2.html';
    const response = await context.env.ASSETS.fetch(new Request(assetUrl.toString(), context.request));
    if (response.ok) {
      const headers = new Headers(response.headers);
      headers.set('content-type', 'text/html; charset=utf-8');
      return new Response(response.body, { status: 200, headers });
    }
  }

  // General clean URL support
  if (url.pathname.endsWith('.html') && url.pathname !== '/index.html') {
    const cleanPath = url.pathname.replace(/\.html$/, '');
    const assetUrl = new URL(url);
    assetUrl.pathname = cleanPath;
    let response = await context.env.ASSETS.fetch(new Request(assetUrl.toString(), context.request));
    if (!response.ok) {
      response = await context.env.ASSETS.fetch(new Request(url.toString(), context.request));
    }
    if (response.ok) {
      const headers = new Headers(response.headers);
      headers.set('content-type', 'text/html; charset=utf-8');
      return new Response(response.body, {
        status: 200,
        headers
      });
    }
  }
  return context.next();
}
