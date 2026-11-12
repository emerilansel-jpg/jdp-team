// JDP Team Portal Application Logic (Vanilla JS)
// Full UX 10/10 & CRO Cross-Sell Implementation

const portal = {
  me: null,
  orders: [],
  activeOrder: null,
  activeFilter: 'all',
  currentTab: 'thread',
  pollInterval: null,
  autoSaveTimer: null,
  staffList: [],
  mobileView: 'orders', // 'orders' or 'details'

  // Step definition for the 6-stage tracker
  steps: ['paid', 'intake_submitted', 'in_progress', 'approval_progress', 'delivered', 'completed'],

  async init() {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        window.location.href = '/login?next=' + encodeURIComponent(window.location.pathname);
        return;
      }
      this.me = await res.json();
      this.renderUser();

      // If staff, reveal privileged UI controls
      if (this.me.role !== 'client') {
        document.getElementById('staffOpsSummaryBar')?.classList.remove('hidden');
        document.getElementById('staffFilterBar')?.classList.remove('hidden');
        document.getElementById('btnNewOrder')?.classList.remove('hidden');
        document.getElementById('staffMsgOptions')?.classList.remove('hidden');
        document.getElementById('btnStaffAddDeliv')?.classList.remove('hidden');
        document.getElementById('btnStaffAddItem')?.classList.remove('hidden');
        this.fetchStaffList();
      }

      await this.loadOrders();

      // Check URL pathname for /orders/:id
      const pathParts = window.location.pathname.split('/');
      if (pathParts[1] === 'orders' && pathParts[2]) {
        const targetId = pathParts[2];
        const match = this.orders.find(o => o.id === targetId || o.id === 'ord_' + targetId);
        if (match) {
          this.selectOrder(match.id);
        } else if (this.orders.length > 0) {
          this.selectOrder(this.orders[0].id);
        }
      } else if (this.orders.length > 0) {
        this.selectOrder(this.orders[0].id);
      }

      // Attach auto-save listener on intake form fields
      this.bindIntakeAutoSave();

      // Start message polling
      this.pollInterval = setInterval(() => {
        if (this.activeOrder && this.currentTab === 'thread') {
          this.fetchMessages(this.activeOrder.id, true);
        }
      }, 4000);

    } catch (err) {
      console.error('[Portal Init Error]', err);
    }
  },

  renderUser() {
    const nameEl = document.getElementById('userName');
    const emailEl = document.getElementById('userEmail');
    const badgeEl = document.getElementById('roleBadge');

    if (nameEl) nameEl.textContent = this.me.display_name || this.me.email;
    if (emailEl) emailEl.textContent = this.me.email;

    if (badgeEl) {
      const roleMap = {
        client: 'Client Portal',
        crew: 'Specialist Workspace',
        manager: 'Project Manager Hub',
        admin: 'Operations Command Hub'
      };
      badgeEl.textContent = roleMap[this.me.role] || this.me.role;
      const baseCls = 'text-[11px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ';
      if (this.me.role === 'admin') badgeEl.className = baseCls + 'text-amber-800 border-amber-300 bg-amber-50';
      else if (this.me.role === 'manager') badgeEl.className = baseCls + 'text-blue-800 border-blue-200 bg-blue-50';
      else if (this.me.role === 'crew') badgeEl.className = baseCls + 'text-cyan-800 border-cyan-200 bg-cyan-50';
      else badgeEl.className = baseCls + 'text-emerald-800 border-emerald-200 bg-emerald-50';
    }
  },

  async loadOrders() {
    const res = await fetch('/api/orders');
    if (!res.ok) return;
    const data = await res.json();
    this.orders = data.orders || [];

    const badge = document.getElementById('ordersCountBadge');
    if (badge) badge.textContent = this.orders.length;
    const mobBadge = document.getElementById('mobileOrderCount');
    if (mobBadge) mobBadge.textContent = this.orders.length;

    // Update Operations KPI overview for staff
    if (this.me && this.me.role !== 'client') {
      const intakeOrders = this.orders.filter(o => o.status === 'intake_submitted');
      const workingOrders = this.orders.filter(o => o.status === 'in_progress');
      const reviewOrders = this.orders.filter(o => o.status === 'approval_progress');
      const totalCents = this.orders.reduce((sum, o) => sum + (o.total_cents || 0), 0);

      const kpiIntake = document.getElementById('kpiIntakeSubmitted');
      if (kpiIntake) kpiIntake.textContent = `${intakeOrders.length} Orders`;
      const kpiProg = document.getElementById('kpiInProgress');
      if (kpiProg) kpiProg.textContent = `${workingOrders.length} Sprints`;
      const kpiRev = document.getElementById('kpiInReview');
      if (kpiRev) kpiRev.textContent = `${reviewOrders.length} Reviews`;
      const kpiTot = document.getElementById('kpiTotalRevenue');
      if (kpiTot) kpiTot.textContent = '$' + (totalCents / 100).toLocaleString('en-US');
    }

    this.renderOrdersList();
  },

  filterOrders(status) {
    this.activeFilter = status;
    document.querySelectorAll('.filter-btn').forEach(btn => {
      const isTarget = btn.getAttribute('data-filter') === status;
      btn.className = isTarget
        ? 'filter-btn active px-2.5 py-1 rounded-lg bg-slate-900 text-white font-semibold shadow-xs'
        : 'filter-btn px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100';
    });
    this.renderOrdersList();
  },

  renderOrdersList() {
    const container = document.getElementById('ordersContainer');
    if (!container) return;

    const isStaff = this.me && this.me.role !== 'client';

    let filtered = this.orders;
    if (this.activeFilter === 'attention') {
      filtered = this.orders.filter(o => o.status === 'intake_submitted' || o.status === 'paid');
    } else if (this.activeFilter !== 'all') {
      filtered = this.orders.filter(o => o.status === this.activeFilter);
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl text-xs bg-white">
          No orders found matching this filter.
        </div>`;
      return;
    }

    container.innerHTML = filtered.map(o => {
      const isActive = this.activeOrder && this.activeOrder.id === o.id;
      const statusPill = this.formatStatusBadge(o.status);
      const amountStr = '$' + (o.total_cents / 100).toFixed(0);
      const relTime = this.timeAgo(o.created_at);
      const shortId = '#' + o.id.replace('ord_', '').slice(0, 6).toUpperCase();
      const clientName = this.esc(o.client_name || o.client_email || 'Client');
      const briefName = this.esc(o.brief || 'Remote Pod / Specialist Package');

      const attentionTag = (isStaff && o.status === 'intake_submitted')
        ? `<div class="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black">
             <span class="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
             <span>⚡ Brief In — Needs PM Assignment</span>
           </div>`
        : '';

      return `
        <div onclick="portal.selectOrder('${o.id}')"
          class="cursor-pointer p-3.5 rounded-2xl border transition-all ${
            isActive
              ? 'bg-blue-50/90 border-brand-500 shadow-sm ring-1 ring-brand-500'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 shadow-2xs'
          }">
          <div class="flex items-start justify-between gap-2 mb-1.5">
            <span class="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">${shortId}</span>
            ${statusPill}
          </div>
          <h4 class="text-sm font-extrabold text-slate-900 line-clamp-1">${isStaff ? clientName : briefName}</h4>
          <p class="text-xs text-slate-600 line-clamp-1 mt-0.5">${isStaff ? briefName : (o.billing_cycle === 'monthly' ? 'Monthly Dedicated Pod' : 'Turnkey Sprint')}</p>
          ${attentionTag}
          <div class="flex items-center justify-between text-xs text-slate-500 mt-2.5 pt-2 border-t border-slate-100">
            <span class="font-bold text-slate-800">${amountStr} &bull; <span class="font-normal text-slate-500 text-[11px]">${o.billing_cycle === 'monthly' ? 'Monthly' : 'One-time'}</span></span>
            <div class="flex items-center gap-2">
              <span class="text-[11px] text-slate-400">${relTime}</span>
              <span class="flex items-center gap-1 font-semibold text-slate-600">
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                ${o.message_count || 0}
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  async selectOrder(orderId) {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) return;
      const data = await res.json();
      this.activeOrder = data.order;
      this.activeOrder.items = data.items || [];
      this.activeOrder.deliverables = data.deliverables || [];
      this.activeOrder.relayAddresses = data.relayAddresses || {};

      document.getElementById('emptyOrderState')?.classList.add('hidden');
      document.getElementById('activeOrderView')?.classList.remove('hidden');

      this.renderOrdersList();
      this.renderActiveOrderHeader();
      this.renderTracker();
      this.renderGuidanceBanner();
      this.renderMonthlySubscriptionCard();
      this.setDetailTab(this.currentTab);
      this.fetchMessages(orderId);
      this.renderIntakeTab();
      this.renderDeliverablesTab();
      this.renderItemsTab();

      // On mobile, auto-switch view to details when user clicks an order
      if (window.innerWidth < 1024) {
        this.switchMobileView('details');
      }

      // Update URL without full reload
      if (window.history.pushState) {
        window.history.pushState(null, '', `/orders/${orderId}`);
      }
    } catch (err) {
      console.error('[Select Order Error]', err);
    }
  },

  renderActiveOrderHeader() {
    const o = this.activeOrder;
    if (!o) return;

    const isStaff = this.me && this.me.role !== 'client';
    const shortId = '#' + o.id.replace('ord_', '').slice(0, 7).toUpperCase();

    const idTag = document.getElementById('orderIdTag');
    if (idTag) {
      idTag.textContent = shortId;
      idTag.title = 'Full Order ID: ' + o.id;
    }
    document.getElementById('orderCycleTag').textContent = o.billing_cycle === 'monthly' ? 'MONTHLY RETENTION POD' : 'TURNKEY SPRINT';
    document.getElementById('orderTitle').textContent = o.brief || 'Remote Specialist / Staff Package';
    document.getElementById('orderClientName').textContent = o.client_name || o.client_email;
    document.getElementById('orderAmount').textContent = '$' + (o.total_cents / 100).toLocaleString('en-US');
    document.getElementById('orderDate').textContent = this.fmtDate(o.created_at);

    // Fast Action WhatsApp Concierge Link with pre-filled message
    const waBtn = document.getElementById('btnWhatsAppConcierge');
    if (waBtn) {
      const briefName = encodeURIComponent(o.brief || 'Specialist Pod Service');
      const orderTag = encodeURIComponent(o.id);
      waBtn.href = `https://wa.me/6281234567890?text=Hi%20JDP%20Team%20PM,%20I'm%20inquiring%20about%20Order%20${orderTag}%20(${briefName})`;
    }

    // Masked relay address display
    const relayAddr = this.me.role === 'client'
      ? o.relayAddresses?.clientRelay
      : o.relayAddresses?.staffRelay;
    const relayEl = document.getElementById('relayEmailAddress');
    if (relayEl && relayAddr) relayEl.textContent = relayAddr;

    // Staff 1-Click Operations Hub Banner
    const actionBanner = document.getElementById('staffOpsActionBanner');
    if (actionBanner) {
      if (!isStaff) {
        actionBanner.classList.add('hidden');
      } else {
        actionBanner.classList.remove('hidden');
        if (o.status === 'paid') {
          actionBanner.innerHTML = `
            <div class="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                <div>
                  <strong class="text-amber-950 font-bold">Awaiting Client Intake Brief:</strong>
                  <span class="text-amber-800"> Client paid. Pod is reserved.</span>
                </div>
              </div>
              <button onclick="portal.setDetailTab('intake')" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-2xs transition">
                Fill Intake on Behalf &rarr;
              </button>
            </div>
          `;
        } else if (o.status === 'intake_submitted') {
          actionBanner.innerHTML = `
            <div class="p-3.5 bg-gradient-to-r from-amber-500 via-brand-600 to-indigo-600 text-white rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <div class="font-extrabold flex items-center gap-1.5 text-sm">
                  <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <span>⚡ Client Submitted Intake Brief</span>
                </div>
                <div class="text-[11px] text-white/90 mt-0.5">Review targets in the Intake Brief tab, assign specialist, and kick off execution.</div>
              </div>
              <div class="flex items-center gap-2">
                <button onclick="portal.quickStartSprint()" class="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-900 rounded-lg font-black shadow-sm transition">
                  🚀 1-Click: Start Sprint Now
                </button>
                <button onclick="portal.setDetailTab('items'); portal.openItemModal()" class="px-3 py-1.5 bg-black/20 hover:bg-black/30 text-white border border-white/20 rounded-lg font-bold transition">
                  Assign Specialist
                </button>
              </div>
            </div>
          `;
        } else if (o.status === 'in_progress') {
          actionBanner.innerHTML = `
            <div class="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <div class="font-extrabold flex items-center gap-1.5 text-sm">
                  <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>⚙️ Specialist Pod Actively Working</span>
                </div>
                <div class="text-[11px] text-white/90 mt-0.5">Upload deliverable links when ready to transition order to client review.</div>
              </div>
              <button onclick="portal.openDeliverableModal()" class="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-900 rounded-lg font-black shadow-sm transition">
                📤 Upload Deliverable File &rarr;
              </button>
            </div>
          `;
        } else if (o.status === 'approval_progress') {
          actionBanner.innerHTML = `
            <div class="p-3.5 bg-purple-50 rounded-xl border border-purple-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                <div>
                  <strong class="text-purple-950 font-bold">Deliverables Sent to Client:</strong>
                  <span class="text-purple-800"> Awaiting client review and approval.</span>
                </div>
              </div>
              <button onclick="portal.setDetailTab('deliverables')" class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-2xs transition">
                View Deliverables &rarr;
              </button>
            </div>
          `;
        } else if (o.status === 'completed' || o.status === 'delivered') {
          actionBanner.innerHTML = `
            <div class="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <div>
                  <strong class="text-emerald-950 font-bold">✓ Order Completed & Verified:</strong>
                  <span class="text-emerald-800"> All deliverables approved.</span>
                </div>
              </div>
              <button onclick="portal.quickSetStatus('in_progress', 'Reopened sprint for additional iterations.')" class="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded-lg font-bold transition">
                Re-open Sprint
              </button>
            </div>
          `;
        }
      }
    }

    // Status Control: If Staff, show Dropdown with Update button. If Client, show badge.
    const container = document.getElementById('statusControlContainer');
    if (container) {
      if (!isStaff) {
        container.innerHTML = this.formatStatusBadge(o.status, true);
      } else {
        container.innerHTML = `
          <div class="flex items-center gap-2">
            <select id="staffStatusSelect" class="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-600 shadow-xs">
              <option value="paid" ${o.status === 'paid' ? 'selected' : ''}>Paid (Kickoff)</option>
              <option value="intake_submitted" ${o.status === 'intake_submitted' ? 'selected' : ''}>Intake Submitted</option>
              <option value="in_progress" ${o.status === 'in_progress' ? 'selected' : ''}>In Progress (Working)</option>
              <option value="approval_progress" ${o.status === 'approval_progress' ? 'selected' : ''}>Approval Progress</option>
              <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
              <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select>
            <button onclick="portal.saveStaffStatus()" class="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs font-bold text-white shadow-xs transition">
              Update
            </button>
          </div>
        `;
      }
    }
  },

  async quickStartSprint() {
    if (!this.activeOrder) return;
    await this.quickSetStatus('in_progress', 'Lead PM reviewed intake brief and officially started execution sprint.');
  },

  async quickSetStatus(newStatus, note = '') {
    if (!this.activeOrder) return;
    const res = await fetch(`/api/orders/${this.activeOrder.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, note: note || `Status changed to ${newStatus}` })
    });
    if (res.ok) {
      await this.selectOrder(this.activeOrder.id);
      await this.loadOrders();
    }
  },

  async trackerStepClicked(stepName) {
    if (!this.activeOrder) return;
    if (this.activeOrder.status === stepName) return;
    const label = stepName.replace(/_/g, ' ').toUpperCase();
    if (!confirm(`Staff 1-Click Action: Advance order status to [${label}]?`)) return;
    await this.quickSetStatus(stepName, `Status manually set to ${label} via interactive tracker.`);
  },

  async saveStaffStatus() {
    if (!this.activeOrder) return;
    const sel = document.getElementById('staffStatusSelect');
    const newStatus = sel.value;
    await this.quickSetStatus(newStatus, 'Status manually updated via staff select control.');
  },

  renderTracker() {
    const o = this.activeOrder;
    if (!o) return;

    const isStaff = this.me && this.me.role !== 'client';
    const currentIndex = this.steps.indexOf(o.status);
    const validIndex = currentIndex === -1 ? 0 : currentIndex;
    const percentage = (validIndex / (this.steps.length - 1)) * 100;

    const bar = document.getElementById('trackerProgressBar');
    if (bar) bar.style.width = `${percentage}%`;

    const nodes = document.querySelectorAll('.step-node');
    nodes.forEach(node => {
      const stepName = node.getAttribute('data-step');
      const stepIndex = this.steps.indexOf(stepName);
      const circle = node.querySelector('.step-circle');
      const label = node.querySelector('.step-label');

      if (isStaff) {
        node.style.cursor = 'pointer';
        node.title = `Staff 1-Click: Click to advance order to ${stepName.replace(/_/g, ' ')}`;
        node.onclick = () => portal.trackerStepClicked(stepName);
      } else {
        node.style.cursor = 'default';
        node.onclick = null;
      }

      if (stepIndex < validIndex) {
        // Completed step
        circle.className = 'step-circle w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-xs';
        circle.innerHTML = '&#10003;';
        label.className = 'step-label text-[11px] font-bold text-emerald-700 mt-2 text-center';
      } else if (stepIndex === validIndex) {
        // Current active step
        circle.className = 'step-circle w-8 h-8 rounded-full bg-brand-600 border-2 border-white text-white flex items-center justify-center text-xs font-black ring-4 ring-brand-100 shadow-sm animate-pulse';
        circle.textContent = stepIndex + 1;
        label.className = 'step-label text-[11px] font-extrabold text-brand-600 mt-2 text-center';
      } else {
        // Upcoming step
        circle.className = 'step-circle w-8 h-8 rounded-full bg-white border-2 border-slate-300 text-slate-400 flex items-center justify-center text-xs font-bold';
        circle.textContent = stepIndex + 1;
        label.className = 'step-label text-[11px] font-semibold text-slate-400 mt-2 text-center';
      }
    });
  },

  // 6. Dynamic "What Happens Next?" Guidance Banner
  renderGuidanceBanner() {
    const o = this.activeOrder;
    const banner = document.getElementById('guidanceBanner');
    if (!banner || !o) return;

    const isStaff = this.me && this.me.role !== 'client';

    const clientGuidanceMap = {
      paid: {
        theme: 'bg-amber-50/80 border-amber-200 text-amber-950',
        badge: '⚡ Kickoff SLA: < 12 Hours',
        badgeStyle: 'bg-amber-100 text-amber-800 border-amber-300',
        title: 'Next Step: Submit Your Project Intake Brief',
        desc: 'Your payment is confirmed and a specialist pod is reserved. Complete the intake form below with target URLs, guidelines, and access so your lead PM can schedule the execution sprint.',
        ctaText: 'Complete Intake Form ↓',
        ctaAction: "portal.setDetailTab('intake')"
      },
      intake_submitted: {
        theme: 'bg-blue-50/80 border-blue-200 text-blue-950',
        badge: '⚡ PM Assignment SLA: < 6 Hours',
        badgeStyle: 'bg-blue-100 text-blue-800 border-blue-300',
        title: 'Intake Under PM Review & Specialist Assignment',
        desc: 'We received your project brief! Your assigned Lead PM is reviewing assets and delegating task cards to your specialists. You will receive an email confirmation once the sprint starts.',
        ctaText: 'View Messages Thread',
        ctaAction: "portal.setDetailTab('thread')"
      },
      in_progress: {
        theme: 'bg-indigo-50/80 border-indigo-200 text-indigo-950',
        badge: '⚡ First Draft SLA: 24–48 Hours',
        badgeStyle: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        title: 'Specialist Pod Actively Executing Sprint',
        desc: 'Your dedicated crew is working on deliverables under PM supervision. Any progress questions or assets will be synchronized through the message thread and masked email relay.',
        ctaText: 'Send Note to Crew',
        ctaAction: "portal.setDetailTab('thread')"
      },
      approval_progress: {
        theme: 'bg-purple-50/80 border-purple-200 text-purple-950',
        badge: '⚡ Free Revisions: Unlimited Within Scope',
        badgeStyle: 'bg-purple-100 text-purple-800 border-purple-300',
        title: 'Action Needed: Deliverables Ready for Review',
        desc: 'Your specialist pod has uploaded completed work files. Please inspect the deliverables in the Deliverables tab. Approve to lock final files or request immediate revisions.',
        ctaText: 'Review Deliverables →',
        ctaAction: "portal.setDetailTab('deliverables')"
      },
      delivered: {
        theme: 'bg-emerald-50/80 border-emerald-200 text-emerald-950',
        badge: '📦 Cloud Archive Guaranteed: 365 Days',
        badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        title: 'Deliverables Finalized & Packaged',
        desc: 'All deliverables are approved and packaged. You can download the production files anytime from your portal archive. Feel free to re-order or expand your retainer.',
        ctaText: 'Browse Wholesale Services',
        ctaAction: 'portal.openStorefrontDrawer()'
      },
      completed: {
        theme: 'bg-emerald-50/80 border-emerald-200 text-emerald-950',
        badge: '🎉 100% Quality & SLA Verified',
        badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        title: 'Order Completed & Verified',
        desc: 'Thank you for choosing JDP.team! Your files are verified and securely archived. Continue scaling your agency by locking in extra pod hours or high-authority backlinks below.',
        ctaText: 'Order Next Sprint →',
        ctaAction: 'portal.openStorefrontDrawer()'
      }
    };

    const staffGuidanceMap = {
      paid: {
        theme: 'bg-amber-50/80 border-amber-200 text-amber-950',
        badge: '⏳ Awaiting Client',
        badgeStyle: 'bg-amber-100 text-amber-800 border-amber-300',
        title: 'Operations Desk: Payment Confirmed, Waiting Client Intake Brief',
        desc: 'Client has completed checkout. If you already received their requirements via email or WhatsApp, you can submit the brief on their behalf in the Intake tab.',
        ctaText: 'Open Intake Brief →',
        ctaAction: "portal.setDetailTab('intake')"
      },
      intake_submitted: {
        theme: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 text-amber-950 shadow-xs',
        badge: '⚡ Action Required: Ready for Sprint Kickoff',
        badgeStyle: 'bg-amber-200 text-amber-900 border-amber-400 font-extrabold',
        title: 'Operations Desk: Review Client Brief & Kick Off Sprint',
        desc: 'Client submitted target keywords, URLs, and access notes. Review the brief in the Intake tab, assign specialist in Items tab, and click "Start Sprint".',
        ctaText: '🚀 Start Sprint Now',
        ctaAction: "portal.quickStartSprint()"
      },
      in_progress: {
        theme: 'bg-blue-50/80 border-blue-200 text-blue-950',
        badge: '⚙️ Sprint in Execution',
        badgeStyle: 'bg-blue-100 text-blue-800 border-blue-300',
        title: 'Operations Desk: Specialist Pod Actively Working',
        desc: 'Sprint is underway. Coordinate tasks with specialists in the Items tab. When work files or links are ready, upload them in Deliverables to request client review.',
        ctaText: 'Upload Deliverable →',
        ctaAction: "portal.openDeliverableModal()"
      },
      approval_progress: {
        theme: 'bg-purple-50/80 border-purple-200 text-purple-950',
        badge: '👀 In Client Review',
        badgeStyle: 'bg-purple-100 text-purple-800 border-purple-300',
        title: 'Operations Desk: Awaiting Client Deliverable Approval',
        desc: 'Deliverables uploaded and client notified via email relay. Once approved, the order will complete automatically, or client may request revisions.',
        ctaText: 'Check Messages',
        ctaAction: "portal.setDetailTab('thread')"
      },
      delivered: {
        theme: 'bg-emerald-50/80 border-emerald-200 text-emerald-950',
        badge: '📦 Deliverables Packaged',
        badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        title: 'Operations Desk: Work Files Packaged',
        desc: 'All artifacts are uploaded and ready. Mark as completed to finalize lifecycle.',
        ctaText: 'Mark Completed',
        ctaAction: "portal.quickSetStatus('completed', 'Order marked completed by staff.')"
      },
      completed: {
        theme: 'bg-emerald-50/80 border-emerald-200 text-emerald-950',
        badge: '✅ Order Verified & Completed',
        badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        title: 'Operations Desk: Sprint Completed',
        desc: 'All deliverables approved by client. Retainer active or sprint archived in portal database.',
        ctaText: 'View Messages',
        ctaAction: "portal.setDetailTab('thread')"
      }
    };

    const g = isStaff
      ? (staffGuidanceMap[o.status] || staffGuidanceMap.paid)
      : (clientGuidanceMap[o.status] || clientGuidanceMap.paid);

    banner.className = `rounded-2xl border p-4 sm:p-5 transition-all duration-300 ${g.theme}`;
    banner.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${g.badgeStyle}">
              ${g.badge}
            </span>
            <span class="text-xs font-bold text-slate-500">Live Guidance</span>
          </div>
          <h3 class="text-sm sm:text-base font-extrabold text-slate-900">${g.title}</h3>
          <p class="text-xs text-slate-600 max-w-2xl leading-relaxed">${g.desc}</p>
        </div>
        <button onclick="${g.ctaAction}" class="self-start sm:self-center shrink-0 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition">
          ${g.ctaText}
        </button>
      </div>
    `;
  },

  // 7. Monthly Subscription Management Card
  renderMonthlySubscriptionCard() {
    const o = this.activeOrder;
    const card = document.getElementById('monthlySubscriptionCard');
    if (!card) return;

    if (o && o.billing_cycle === 'monthly') {
      card.classList.remove('hidden');
      const rateEl = document.getElementById('subRateDisplay');
      if (rateEl) {
        rateEl.textContent = '$' + (o.total_cents / 100).toLocaleString('en-US') + ' / mo';
      }
    } else {
      card.classList.add('hidden');
    }
  },

  setDetailTab(tab) {
    this.currentTab = tab;
    const tabMap = {
      thread: { btn: 'tabBtnThread', content: 'tabContentThread' },
      intake: { btn: 'tabBtnIntake', content: 'tabContentIntake' },
      deliverables: { btn: 'tabBtnDeliverables', content: 'tabContentDeliverables' },
      items: { btn: 'tabBtnItems', content: 'tabContentItems' }
    };

    Object.keys(tabMap).forEach(key => {
      const isTarget = key === tab;
      const btn = document.getElementById(tabMap[key].btn);
      const content = document.getElementById(tabMap[key].content);

      if (btn) {
        btn.className = isTarget
          ? 'detail-tab px-4 py-2.5 text-sm font-bold border-b-2 border-brand-600 text-brand-600 whitespace-nowrap'
          : 'detail-tab px-4 py-2.5 text-sm font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-900 whitespace-nowrap';
      }
      if (content) {
        content.classList.toggle('hidden', !isTarget);
      }
    });
  },

  async fetchMessages(orderId, isBackground = false) {
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`);
      if (!res.ok) return;
      const data = await res.json();
      const messages = data.messages || [];

      document.getElementById('tabMsgCount').textContent = messages.length;

      const list = document.getElementById('messagesList');
      if (!list) return;

      if (messages.length === 0) {
        list.innerHTML = `<div class="text-center text-slate-400 text-xs py-8">No messages yet. Send a note or reply to the email notification.</div>`;
        return;
      }

      list.innerHTML = messages.map(m => {
        const isClientMsg = m.author_role === 'client';
        const isInternal = m.kind === 'internal';

        let badgeStyle = 'bg-blue-100 text-blue-800 border-blue-200';
        if (isClientMsg) badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-200';
        if (isInternal) badgeStyle = 'bg-amber-100 text-amber-800 border-amber-200';

        const cardStyle = isInternal
          ? 'bg-amber-50/80 border-amber-200'
          : (isClientMsg ? 'bg-white border-slate-200 shadow-xs' : 'bg-blue-50/70 border-blue-200');

        return `
          <div class="p-3.5 rounded-xl border ${cardStyle}">
            <div class="flex items-center justify-between text-xs mb-1.5">
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900">${this.esc(m.author_name || 'Staff')}</span>
                <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${badgeStyle}">
                  ${isInternal ? 'INTERNAL NOTE' : (isClientMsg ? 'CLIENT' : 'STAFF')}
                </span>
              </div>
              <span class="text-[11px] text-slate-400">${this.fmtTime(m.created_at)}</span>
            </div>
            <div class="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">${this.esc(m.body)}</div>
          </div>
        `;
      }).join('');

      // Scroll to bottom on initial load
      if (!isBackground) {
        list.scrollTop = list.scrollHeight;
      }
    } catch (err) {
      console.error('[Fetch Messages Error]', err);
    }
  },

  async sendMessage(e) {
    e.preventDefault();
    if (!this.activeOrder) return;

    const input = document.getElementById('msgBody');
    const text = input.value.trim();
    if (!text) return;

    const kindInput = document.querySelector('input[name="msgKind"]:checked');
    const kind = kindInput ? kindInput.value : 'client';

    const btn = document.getElementById('btnSendMsg');
    btn.disabled = true;

    try {
      const res = await fetch(`/api/orders/${this.activeOrder.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: text, kind })
      });
      if (res.ok) {
        input.value = '';
        await this.fetchMessages(this.activeOrder.id);
        const list = document.getElementById('messagesList');
        if (list) list.scrollTop = list.scrollHeight;
      }
    } finally {
      btn.disabled = false;
    }
  },

  // 8. Intake Form Handling with Presets & Auto-save
  renderIntakeTab() {
    const o = this.activeOrder;
    if (!o) return;

    const intake = o.intake_parsed || {};

    // Check if local storage has unsaved draft
    const draftKey = 'jdp_intake_draft_' + o.id;
    const localDraft = localStorage.getItem(draftKey);
    let populatedFromDraft = false;

    if (localDraft && !intake.submitted_at) {
      try {
        const parsedDraft = JSON.parse(localDraft);
        document.getElementById('intakeUrls').value = parsedDraft.target_urls || '';
        document.getElementById('intakeKeywords').value = parsedDraft.keywords || '';
        document.getElementById('intakeDrive').value = parsedDraft.drive_links || '';
        document.getElementById('intakeAccess').value = parsedDraft.access_notes || '';
        document.getElementById('intakeExtra').value = parsedDraft.extra_details || '';
        populatedFromDraft = true;
      } catch (e) {
        console.warn('Draft parse error', e);
      }
    }

    if (!populatedFromDraft) {
      document.getElementById('intakeUrls').value = intake.target_urls || '';
      document.getElementById('intakeKeywords').value = intake.keywords || '';
      document.getElementById('intakeDrive').value = intake.drive_links || '';
      document.getElementById('intakeAccess').value = intake.access_notes || '';
      document.getElementById('intakeExtra').value = intake.extra_details || '';
    }

    const notice = document.getElementById('intakeStatusNotice');
    if (intake.submitted_at) {
      notice.textContent = `Intake submitted on ${this.fmtDate(intake.submitted_at)}`;
    } else {
      notice.textContent = populatedFromDraft ? 'Draft restored from browser storage.' : 'Intake pending submission.';
    }
  },

  bindIntakeAutoSave() {
    const fields = ['intakeUrls', 'intakeKeywords', 'intakeDrive', 'intakeAccess', 'intakeExtra'];
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          if (!this.activeOrder) return;
          clearTimeout(this.autoSaveTimer);
          const ind = document.getElementById('draftSaveIndicator');
          if (ind) ind.innerHTML = '<span class="text-amber-500">Saving draft...</span>';

          this.autoSaveTimer = setTimeout(() => {
            const draft = {
              target_urls: document.getElementById('intakeUrls').value,
              keywords: document.getElementById('intakeKeywords').value,
              drive_links: document.getElementById('intakeDrive').value,
              access_notes: document.getElementById('intakeAccess').value,
              extra_details: document.getElementById('intakeExtra').value
            };
            localStorage.setItem('jdp_intake_draft_' + this.activeOrder.id, JSON.stringify(draft));
            if (ind) {
              ind.innerHTML = `
                <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <span class="text-emerald-600 font-semibold">Auto-saved to browser</span>
              `;
            }
          }, 1000);
        });
      }
    });
  },

  applyIntakePreset(type) {
    const presets = {
      seo_audit: {
        urls: 'https://clientbrand.com, https://competitorbrand.com',
        keywords: 'b2b saas billing, automated payment reconciliation, recurring invoicing api',
        drive: 'https://drive.google.com/drive/folders/jdp-client-audit-assets-shared',
        access: 'Google Search Console delegation to ops@jdp.team (Full Viewer) / Screaming Frog crawl authorization',
        extra: 'Please focus the crawl on canonicalization loops, 4xx broken internal links, and Core Web Vitals LCP bottlenecks on core product landing pages.'
      },
      content_writing: {
        urls: 'https://clientbrand.com/blog',
        keywords: 'remote executive assistant cost, hiring offshore talent, virtual staff agency playbook',
        drive: 'https://drive.google.com/drive/folders/jdp-brand-voice-guidelines-shared',
        access: 'WordPress editor seat or Google Docs review comments link',
        extra: 'Target 1,200+ words per article. Surfer SEO target score: 80+. Tone: authoritative, data-driven, B2B SaaS executive audience. Include CTA linking to demo calendar.'
      },
      va_pod: {
        urls: 'https://clientbrand.com',
        keywords: 'Apollo lead enrichment, CRM data hygiene, executive calendar scheduling',
        drive: 'https://drive.google.com/drive/folders/jdp-sop-training-materials-shared',
        access: '1Password shared vault or delegated Apollo.io / HubSpot seat',
        extra: 'Daily execution sprint: 25 verified leads enriched per day + CRM pipeline stage updates by 5pm EST. Lead PM to review data accuracy daily.'
      }
    };

    const p = presets[type];
    if (!p) return;

    document.getElementById('intakeUrls').value = p.urls;
    document.getElementById('intakeKeywords').value = p.keywords;
    document.getElementById('intakeDrive').value = p.drive;
    document.getElementById('intakeAccess').value = p.access;
    document.getElementById('intakeExtra').value = p.extra;

    // Trigger auto-save
    if (this.activeOrder) {
      localStorage.setItem('jdp_intake_draft_' + this.activeOrder.id, JSON.stringify({
        target_urls: p.urls,
        keywords: p.keywords,
        drive_links: p.drive,
        access_notes: p.access,
        extra_details: p.extra
      }));
    }

    const ind = document.getElementById('draftSaveIndicator');
    if (ind) {
      ind.innerHTML = `
        <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        <span class="text-emerald-600 font-semibold">Preset applied & saved</span>
      `;
    }
  },

  clearIntakeDraft() {
    if (!confirm('Clear this intake draft?')) return;
    if (this.activeOrder) {
      localStorage.removeItem('jdp_intake_draft_' + this.activeOrder.id);
    }
    document.getElementById('intakeUrls').value = '';
    document.getElementById('intakeKeywords').value = '';
    document.getElementById('intakeDrive').value = '';
    document.getElementById('intakeAccess').value = '';
    document.getElementById('intakeExtra').value = '';
    const ind = document.getElementById('draftSaveIndicator');
    if (ind) ind.textContent = 'Draft cleared.';
  },

  async submitIntake(e) {
    e.preventDefault();
    if (!this.activeOrder) return;

    const btn = document.getElementById('btnSaveIntake');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    const payload = {
      target_urls: document.getElementById('intakeUrls').value,
      keywords: document.getElementById('intakeKeywords').value,
      drive_links: document.getElementById('intakeDrive').value,
      access_notes: document.getElementById('intakeAccess').value,
      extra_details: document.getElementById('intakeExtra').value
    };

    try {
      const res = await fetch(`/api/orders/${this.activeOrder.id}/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        localStorage.removeItem('jdp_intake_draft_' + this.activeOrder.id);
        await this.selectOrder(this.activeOrder.id);
        await this.loadOrders();
        alert('Project intake details saved successfully! Your specialist pod and lead PM have been notified.');
      }
    } finally {
      btn.disabled = false;
      btn.textContent = 'Submit Project Intake';
    }
  },

  // 9. Deliverables Tab & Review Actions
  renderDeliverablesTab() {
    const o = this.activeOrder;
    if (!o) return;

    const delivs = o.deliverables || [];
    document.getElementById('tabDelivCount').textContent = delivs.length;

    const container = document.getElementById('deliverablesContainer');
    if (!container) return;

    if (delivs.length === 0) {
      container.innerHTML = `
        <div class="text-center text-slate-400 text-xs py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          No deliverables submitted yet. Once your pod finishes work, deliverables will appear here for your review and approval.
        </div>`;
      return;
    }

    container.innerHTML = delivs.map(d => {
      const isApproved = d.status === 'approved';
      const isRevision = d.status === 'revision_requested';

      let statusBadge = '<span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">PENDING REVIEW</span>';
      if (isApproved) {
        statusBadge = '<span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">APPROVED</span>';
      } else if (isRevision) {
        statusBadge = '<span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">REVISION REQUESTED</span>';
      }

      const clientActions = this.me.role === 'client' && !isApproved ? `
        <div class="flex items-center gap-2 pt-3 border-t border-slate-100">
          <button onclick="portal.approveDeliverable('${d.id}')" class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-xs transition">
            Approve Deliverable
          </button>
          <button onclick="portal.openRevisionModal('${d.id}')" class="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition">
            Request Revision
          </button>
        </div>
      ` : '';

      return `
        <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h4 class="text-sm font-bold text-slate-900">${this.esc(d.title)}</h4>
              <p class="text-xs text-slate-600 mt-1">${this.esc(d.notes || 'No description provided.')}</p>
            </div>
            ${statusBadge}
          </div>

          <div class="flex items-center justify-between text-xs pt-1">
            <a href="${this.esc(d.file_url)}" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 font-bold text-brand-600 hover:text-brand-700 underline">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              View / Download Artifact
            </a>
            <span class="text-[11px] text-slate-400">${this.fmtDate(d.created_at)}</span>
          </div>

          ${d.client_feedback ? `
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <strong class="text-slate-900">Feedback:</strong> ${this.esc(d.client_feedback)}
            </div>
          ` : ''}

          ${clientActions}
        </div>
      `;
    }).join('');
  },

  async approveDeliverable(delivId) {
    if (!confirm('Approve this deliverable as complete?')) return;
    const res = await fetch(`/api/orders/${this.activeOrder.id}/deliverables/${delivId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' })
    });
    if (res.ok) {
      await this.selectOrder(this.activeOrder.id);
      await this.loadOrders();

      // Trigger the 10/10 milestone celebration upsell modal for client
      if (this.me.role === 'client') {
        this.openMilestoneModal();
      }
    }
  },

  openRevisionModal(delivId) {
    document.getElementById('revDelivId').value = delivId;
    document.getElementById('revFeedback').value = '';
    this.openModal('modalRevision');
  },

  async submitRevisionRequest(e) {
    e.preventDefault();
    const delivId = document.getElementById('revDelivId').value;
    const feedback = document.getElementById('revFeedback').value.trim();

    const res = await fetch(`/api/orders/${this.activeOrder.id}/deliverables/${delivId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'request_revision', feedback })
    });
    if (res.ok) {
      this.closeModal('modalRevision');
      await this.selectOrder(this.activeOrder.id);
      await this.loadOrders();
    }
  },

  renderItemsTab() {
    const o = this.activeOrder;
    if (!o) return;

    const items = o.items || [];
    const container = document.getElementById('itemsContainer');
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = `<div class="text-center text-slate-400 text-xs py-6">No items listed.</div>`;
      return;
    }

    container.innerHTML = items.map(it => `
      <div class="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-xs">
        <div>
          <h5 class="font-bold text-slate-900 text-sm">${this.esc(it.service_name)}</h5>
          <span class="text-slate-500">Qty: ${it.qty} &bull; ${it.notes ? this.esc(it.notes) : 'Standard scope'}</span>
        </div>
        <div class="text-right">
          <div class="font-semibold text-slate-600">Assigned: <strong class="text-slate-900">${this.esc(it.assigned_crew_name || 'Unassigned')}</strong></div>
          <span class="text-[10px] uppercase font-bold text-brand-600">${it.status}</span>
        </div>
      </div>
    `).join('');
  },

  async fetchStaffList() {
    try {
      const res = await fetch('/api/users/staff');
      if (!res.ok) return;
      const data = await res.json();
      this.staffList = data.staff || [];

      const select = document.getElementById('itemAssignCrew');
      if (select) {
        select.innerHTML = '<option value="">-- Unassigned --</option>' +
          this.staffList.map(s => `<option value="${s.id}">${this.esc(s.display_name || s.email)} (${s.role})</option>`).join('');
      }
    } catch (err) {
      console.error('[Fetch Staff Error]', err);
    }
  },

  // CRO & Cross-Sell Actions
  async addPodOvertime() {
    if (!this.activeOrder) return;
    if (!confirm('Add +20 Hours Pod Overtime ($60 wholesale) to this sprint?')) return;

    const note = `[POD OVERTIME REQUEST] Client requested +20 hours of pod overtime ($60 wholesale). Lead PM please assign extra capacity to active sprint.`;
    await this.postCrossSellMessage(note, 'Pod Overtime (+20 hrs) added to order queue.');
  },

  async claimOrderBump(bumpKey, price, bumpTitle) {
    if (!this.activeOrder) return;
    if (!confirm(`Add "${bumpTitle}" (+$${price}) to your current sprint?`)) return;

    const note = `[ORDER BUMP CLAIMED] Client added: ${bumpTitle} (+$${price}). Fast-track queue and attach to active sprint.`;
    await this.postCrossSellMessage(note, `"${bumpTitle}" added! Your PM has been notified.`);
  },

  async claimMilestoneUpsell() {
    if (!this.activeOrder) return;
    const note = `[MILESTONE UPSELL CLAIMED] Client accepted 20% Off 10 High-Authority Backlinks reward ($160). Lead PM please prepare anchor text matrix.`;
    await this.postCrossSellMessage(note, 'Offer claimed! Our SEO link strategist will follow up in this thread.');
    this.closeModal('modalMilestone');
  },

  async inquireService(serviceName, rate) {
    if (!this.activeOrder) {
      alert(`To order "${serviceName}", please select an active order or contact our PM via WhatsApp.`);
      return;
    }
    const note = `[WHOLESALE CATALOG INQUIRY] Client is inquiring about adding: ${serviceName} (${rate}). PM please follow up with scope and kickoff terms.`;
    await this.postCrossSellMessage(note, `Inquiry for "${serviceName}" logged. Your PM will respond shortly in this thread.`);
    this.closeStorefrontDrawer();
    this.setDetailTab('thread');
  },

  async submitSyncBooking(e) {
    e.preventDefault();
    if (!this.activeOrder) return;

    const topic = document.getElementById('syncTopic').value;
    const timeframe = document.getElementById('syncTimeframe').value.trim();
    const notes = document.getElementById('syncNotes').value.trim();

    const note = `[15M PM SYNC REQUEST] Client requested a 15-minute live PM Sync.\nTopic: ${topic}\nPreferred Timeframe: ${timeframe}\nNotes: ${notes || 'None'}`;
    await this.postCrossSellMessage(note, 'Sync request submitted! Your PM will confirm the calendar invite.');
    this.closeModal('modalSync');
  },

  async postCrossSellMessage(bodyText, successNotice) {
    try {
      const res = await fetch(`/api/orders/${this.activeOrder.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: bodyText, kind: 'client' })
      });
      if (res.ok) {
        await this.fetchMessages(this.activeOrder.id);
        alert(successNotice);
      }
    } catch (err) {
      console.error('[Cross-Sell Message Error]', err);
    }
  },

  copyRelayEmail() {
    const relayEl = document.getElementById('relayEmailAddress');
    const text = relayEl ? relayEl.textContent.trim() : '';
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      const textEl = document.getElementById('textCopyRelay');
      const original = textEl.textContent;
      textEl.textContent = '✓ Copied!';
      setTimeout(() => {
        textEl.textContent = original;
      }, 2000);
    }).catch(err => {
      console.error('Copy failed', err);
    });
  },

  // Mobile segmented view switcher
  switchMobileView(view) {
    this.mobileView = view;
    const btnOrders = document.getElementById('btnMobileViewOrders');
    const btnDetails = document.getElementById('btnMobileViewDetails');
    const colOrders = document.getElementById('columnOrdersList');
    const colDetails = document.getElementById('columnOrderDetails');

    if (view === 'orders') {
      if (btnOrders) btnOrders.className = 'flex-1 py-2 rounded-lg transition-all text-center bg-white text-slate-900 shadow-xs font-bold';
      if (btnDetails) btnDetails.className = 'flex-1 py-2 rounded-lg transition-all text-center text-slate-600 hover:text-slate-900 font-bold';
      if (colOrders) colOrders.classList.remove('hidden');
      if (colDetails) colDetails.classList.add('hidden');
    } else {
      if (btnOrders) btnOrders.className = 'flex-1 py-2 rounded-lg transition-all text-center text-slate-600 hover:text-slate-900 font-bold';
      if (btnDetails) btnDetails.className = 'flex-1 py-2 rounded-lg transition-all text-center bg-white text-slate-900 shadow-xs font-bold';
      if (colOrders) colOrders.classList.add('hidden');
      if (colDetails) {
        colDetails.classList.remove('hidden');
        colDetails.classList.add('flex');
      }
    }
  },

  // Modals & Drawers
  openModal(id) { document.getElementById(id)?.classList.remove('hidden'); },
  closeModal(id) { document.getElementById(id)?.classList.add('hidden'); },

  openSyncModal() { this.openModal('modalSync'); },
  openMilestoneModal() { this.openModal('modalMilestone'); },
  openNewOrderModal() { this.openModal('modalNewOrder'); },
  openDeliverableModal() { this.openModal('modalDeliverable'); },
  openItemModal() { this.openModal('modalItem'); },

  openStorefrontDrawer() {
    document.getElementById('drawerStorefront')?.classList.remove('hidden');
  },
  closeStorefrontDrawer() {
    document.getElementById('drawerStorefront')?.classList.add('hidden');
  },

  async submitNewOrder(e) {
    e.preventDefault();
    const payload = {
      client_email: document.getElementById('newOrderEmail').value.trim(),
      client_name: document.getElementById('newOrderName').value.trim(),
      service_name: document.getElementById('newOrderService').value.trim(),
      total_cents: Math.round(parseFloat(document.getElementById('newOrderAmount').value) * 100),
      billing_cycle: document.getElementById('newOrderCycle').value
    };

    const res = await fetch('/api/orders/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const data = await res.json();
      this.closeModal('modalNewOrder');
      await this.loadOrders();
      if (data.order_id) {
        this.selectOrder(data.order_id);
      }
    }
  },

  async submitDeliverable(e) {
    e.preventDefault();
    if (!this.activeOrder) return;

    const payload = {
      title: document.getElementById('delivTitle').value.trim(),
      file_url: document.getElementById('delivUrl').value.trim(),
      notes: document.getElementById('delivNotes').value.trim()
    };

    const res = await fetch(`/api/orders/${this.activeOrder.id}/deliverables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      this.closeModal('modalDeliverable');
      await this.selectOrder(this.activeOrder.id);
      await this.loadOrders();
    }
  },

  async submitItem(e) {
    e.preventDefault();
    if (!this.activeOrder) return;

    const payload = {
      service_name: document.getElementById('itemServiceName').value.trim(),
      qty: parseFloat(document.getElementById('itemQty').value),
      assigned_crew_id: document.getElementById('itemAssignCrew').value || null,
      notes: document.getElementById('itemNotes').value.trim()
    };

    const res = await fetch(`/api/orders/${this.activeOrder.id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      this.closeModal('modalItem');
      await this.selectOrder(this.activeOrder.id);
    }
  },

  async logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  },

  formatStatusBadge(status, large = false) {
    const pad = large ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]';
    const isStaff = this.me && this.me.role !== 'client';

    const badges = {
      paid: {
        cls: 'bg-amber-50 text-amber-800 border-amber-200',
        label: isStaff ? '🟡 Paid (Wait Brief)' : '🟡 Reserved (Submit Brief)'
      },
      intake_submitted: {
        cls: 'bg-amber-100 text-amber-900 border-amber-300 font-black',
        label: isStaff ? '⚡ Brief In (Review)' : '🔵 Brief Under Review'
      },
      in_progress: {
        cls: 'bg-blue-50 text-blue-800 border-blue-200',
        label: isStaff ? '⚙️ Sprint Active' : '⚙️ Pod Working'
      },
      approval_progress: {
        cls: 'bg-purple-50 text-purple-800 border-purple-200',
        label: isStaff ? '👀 In Client Review' : '🎁 Ready for Review'
      },
      delivered: {
        cls: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        label: '📦 Delivered'
      },
      completed: {
        cls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        label: '✓ Completed'
      }
    };

    const b = badges[status] || {
      cls: 'bg-slate-100 text-slate-700 border-slate-200',
      label: (status || '').replace(/_/g, ' ')
    };

    return `<span class="inline-flex items-center gap-1 rounded-full border font-bold uppercase tracking-wider ${pad} ${b.cls}">${b.label}</span>`;
  },

  fmtDate(iso) {
    if (!iso) return '';
    const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  fmtTime(iso) {
    if (!iso) return '';
    const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
           d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  },

  timeAgo(iso) {
    if (!iso) return '';
    const d = new Date(iso.endsWith('Z') ? iso : iso + 'Z');
    const diffMs = Date.now() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return diffMin + 'm ago';
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return diffHr + 'h ago';
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 30) return diffDays + 'd ago';
    return this.fmtDate(iso);
  },

  esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
};

window.addEventListener('DOMContentLoaded', () => {
  portal.init();
});
