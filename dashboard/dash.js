// Shared helpers for JDP.team dashboard pages (vanilla JS, Tailwind via CDN)
// Expects: <script src="/dashboard/dash.js"></script> after Tailwind.

const dash = {
  me: null,

  async init(expectedRole) {
    const res = await fetch('/api/auth/me');
    if (!res.ok) { location.href = '/dashboard/login.html?next=' + encodeURIComponent(location.pathname); return null; }
    this.me = await res.json();
    if (expectedRole && this.me.role !== expectedRole && !(this.me.role === 'admin' && expectedRole === 'manager')) {
      const home = { client: '/dashboard/client.html', manager: '/dashboard/manager.html', crew: '/dashboard/crew.html', admin: '/dashboard/admin.html' }[this.me.role];
      location.href = home || '/dashboard/login.html';
      return null;
    }
    // Fill common UI hooks if present
    const nameEl = document.getElementById('userName');
    if (nameEl) nameEl.textContent = this.me.display_name || this.me.email;
    const roleEl = document.getElementById('userRole');
    if (roleEl) roleEl.textContent = this.me.role;
    return this.me;
  },

  async logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    location.href = '/dashboard/login.html';
  },

  money(cents) {
    return '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: cents % 100 ? 2 : 0 });
  },

  fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' +
           d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  },

  statusBadge(status) {
    const map = {
      new: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      scoping: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      quoted: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
      in_progress: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      review: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
      delivered: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      cancelled: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      queued: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      assigned: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      working: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      done: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    };
    const cls = map[status] || 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    const label = (status || '').replace(/_/g, ' ');
    return `<span class="inline-block px-2 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wide ${cls}">${label}</span>`;
  },

  esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  },
};
