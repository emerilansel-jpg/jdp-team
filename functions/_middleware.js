export async function onRequest(context) {
  const url = new URL(context.request.url);

  // --- Dashboard role guards (server-side; never trust the client) ---
  if (url.pathname.startsWith('/dashboard/')) {
    const pathname = url.pathname;

    // Public: the login page itself
    if (pathname === '/dashboard/login.html' || pathname === '/dashboard/login' || pathname === '/dashboard/') {
      return context.next();
    }

    const user = await getSessionUser(context.env, context.request);
    if (!user) {
      const back = encodeURIComponent(pathname);
      return Response.redirect(`${url.origin}/dashboard/login.html?next=${back}`, 302);
    }

    // Route prefixes each role may access
    const allow = {
      client: ['/dashboard/client'],
      manager: ['/dashboard/manager'],
      crew: ['/dashboard/crew'],
      admin: ['/dashboard/admin', '/dashboard/manager'], // admin can view manager tools
    };
    const allowed = (allow[user.role] || []).some((p) => pathname.startsWith(p));
    if (!allowed) {
      // Send them to their own dashboard instead of a hard 403
      const home = {
        client: '/dashboard/client.html',
        manager: '/dashboard/manager.html',
        crew: '/dashboard/crew.html',
        admin: '/dashboard/admin.html',
      }[user.role] || '/dashboard/login.html';
      return Response.redirect(`${url.origin}${home}`, 302);
    }
    return context.next();
  }

  // --- Existing public-site clean URL handling (unchanged) ---
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

// Minimal inline session lookup (duplicated from api/_lib/auth.js because
// _middleware.js runs at the root and can't import from /api/ reliably).
async function getSessionUser(env, request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|;\s*)jdp_session=([^;]+)/);
  if (!match) return null;
  const token = match[1];
  const row = await env.DB.prepare(
    `SELECT u.id, u.email, u.role, u.display_name
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = ? AND s.expires_at > datetime('now')`
  ).bind(token).first();
  return row || null;
}
