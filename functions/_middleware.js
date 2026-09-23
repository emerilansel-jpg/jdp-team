export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.pathname.endsWith('.html') && url.pathname !== '/index.html') {
    const cleanPath = url.pathname.replace(/\.html$/, '');
    const assetUrl = new URL(url);
    assetUrl.pathname = cleanPath;
    const response = await context.env.ASSETS.fetch(new Request(assetUrl.toString(), context.request));
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
