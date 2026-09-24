/**
 * JDP.team - Hallmark & Taste Motion System Controller
 * Pure vanilla JS, GPU-accelerated, zero-dependency, WCAG AA accessible.
 */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ==========================================
  // 1. Reading Progress Bar
  // ==========================================
  function initProgressBar() {
    let progressBar = document.getElementById('progress-bar');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.id = 'progress-bar';
      document.body.prepend(progressBar);
    }

    if (prefersReduced) return;

    let ticking = false;
    function updateProgress() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const scrolled = (window.scrollY / docHeight) * 100;
        progressBar.style.width = Math.min(100, Math.max(0, scrolled)) + '%';
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    }, { passive: true });

    updateProgress();
  }

  // ==========================================
  // 2. Interactive Card Mouse Spotlight / Glow
  // ==========================================
  function initSpotlight() {
    if (prefersReduced) return;
    const cards = document.querySelectorAll('.spotlight-card, .card-clean');

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--mouse-x', `-999px`);
        card.style.setProperty('--mouse-y', `-999px`);
      });
    });
  }

  // ==========================================
  // 3. Staggered Intersection Scroll Reveals
  // ==========================================
  function initScrollReveals() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (revealElements.length === 0) return;

    if (prefersReduced || !('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  // ==========================================
  // 4. Live rAF Stat Counters
  // ==========================================
  function initCounters() {
    const counterElements = document.querySelectorAll('[data-counter]');
    if (counterElements.length === 0) return;

    function formatNumber(val, decimals) {
      if (decimals > 0) {
        return val.toFixed(decimals);
      }
      return Math.round(val).toLocaleString();
    }

    function animateCounter(el) {
      const target = parseFloat(el.getAttribute('data-counter'));
      if (isNaN(target)) return;

      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      const duration = parseInt(el.getAttribute('data-duration') || '1400', 10);

      if (prefersReduced) {
        el.textContent = `${prefix}${formatNumber(target, decimals)}${suffix}`;
        return;
      }

      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentVal = target * ease;

        el.textContent = `${prefix}${formatNumber(currentVal, decimals)}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = `${prefix}${formatNumber(target, decimals)}${suffix}`;
        }
      }

      requestAnimationFrame(update);
    }

    if (!('IntersectionObserver' in window)) {
      counterElements.forEach(animateCounter);
      return;
    }

    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    counterElements.forEach(el => counterObserver.observe(el));
  }

  // ==========================================
  // 5. Floating Back-to-Top Button
  // ==========================================
  function initBackToTop() {
    let btn = document.getElementById('backToTopBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'backToTopBtn';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Back to top');
      btn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>`;
      document.body.appendChild(btn);
    }

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 450) {
            btn.classList.add('is-visible');
          } else {
            btn.classList.remove('is-visible');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ==========================================
  // 6. Interactive Live Typing / Task Simulation
  // ==========================================
  function initLiveTaskSimulation() {
    const container = document.getElementById('liveTaskSim');
    if (!container) return;

    const taskTextEl = container.querySelector('.sim-task-text');
    const roleBadgeEl = container.querySelector('.sim-role-badge');
    const rateBadgeEl = container.querySelector('.sim-rate-badge');
    const statusBadgeEl = container.querySelector('.sim-status-badge');
    const creditsEl = container.querySelector('.sim-credits');

    if (!taskTextEl) return;

    const tasks = [
      {
        text: "Edit 8 vertical TikTok Reels with captions & cuts",
        role: "Video Editor",
        rate: "$5.00/hr",
        credits: "4,000 credits ($40.00)",
        status: "Completed in 8h"
      },
      {
        text: "Clean & format 450 row Lead CSV with verified emails",
        role: "Junior VA",
        rate: "$3.00/hr",
        credits: "1,200 credits ($12.00)",
        status: "Completed in 4h"
      },
      {
        text: "Write 1,500-word SEO Pillar Article + SurferSEO Score 85+",
        role: "SEO Specialist",
        rate: "Fixed Art",
        credits: "3,200 credits ($32.00)",
        status: "Completed in 24h"
      },
      {
        text: "Update 18 WooCommerce product landing pages & prices",
        role: "Senior Tech VA",
        rate: "$5.00/hr",
        credits: "1,500 credits ($15.00)",
        status: "Completed in 3h"
      }
    ];

    let currentIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    function typeLoop() {
      const currentTask = tasks[currentIdx];

      if (roleBadgeEl) roleBadgeEl.textContent = currentTask.role;
      if (rateBadgeEl) rateBadgeEl.textContent = currentTask.rate;
      if (creditsEl) creditsEl.textContent = currentTask.credits;
      if (statusBadgeEl) {
        statusBadgeEl.textContent = isDeleting ? 'Processing...' : currentTask.status;
        statusBadgeEl.className = isDeleting
          ? 'px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200'
          : 'px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200';
      }

      if (!isDeleting) {
        taskTextEl.textContent = currentTask.text.substring(0, charIdx + 1);
        charIdx++;
        if (charIdx === currentTask.text.length) {
          isDeleting = true;
          setTimeout(typeLoop, 2800);
          return;
        }
        setTimeout(typeLoop, 35);
      } else {
        taskTextEl.textContent = currentTask.text.substring(0, charIdx - 1);
        charIdx--;
        if (charIdx === 0) {
          isDeleting = false;
          currentIdx = (currentIdx + 1) % tasks.length;
          setTimeout(typeLoop, 400);
          return;
        }
        setTimeout(typeLoop, 18);
      }
    }

    if (!prefersReduced) {
      setTimeout(typeLoop, 600);
    } else {
      taskTextEl.textContent = tasks[0].text;
    }
  }

  // ==========================================
  // 7. Interactive Tab Pill Slider
  // ==========================================
  function initPillTabs() {
    const containers = document.querySelectorAll('.pill-tab-container');
    containers.forEach(container => {
      const indicator = container.querySelector('.pill-tab-indicator');
      const buttons = container.querySelectorAll('.pill-tab-btn');
      if (!indicator || buttons.length === 0) return;

      function updateIndicator(btn) {
        const rect = btn.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        indicator.style.width = `${rect.width}px`;
        indicator.style.transform = `translateX(${rect.left - containerRect.left - 4}px)`;
      }

      const activeBtn = container.querySelector('.pill-tab-btn.is-active') || buttons[0];
      if (activeBtn) {
        activeBtn.classList.add('is-active');
        // Initial setup after layout
        setTimeout(() => updateIndicator(activeBtn), 50);
      }

      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          updateIndicator(btn);
        });
      });

      window.addEventListener('resize', () => {
        const curr = container.querySelector('.pill-tab-btn.is-active');
        if (curr) updateIndicator(curr);
      });
    });
  }

  // ==========================================
  // 8. Celebration Confetti (For High Savings >80%)
  // ==========================================
  window.triggerConfetti = function () {
    if (prefersReduced) return;
    const colors = ['#2563eb', '#10b981', '#60a5fa', '#34d399', '#f59e0b', '#8b5cf6'];
    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'confetti-particle';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 8 + 5;
      const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 300;
      const startY = window.innerHeight * 0.45;
      const destX = startX + (Math.random() - 0.5) * 450;
      const destY = startY + Math.random() * 350 - 80;
      const rotate = Math.random() * 360;

      particle.style.cssText = `
        left: ${startX}px;
        top: ${startY}px;
        width: ${size}px;
        height: ${size * 0.6}px;
        background: ${color};
        transform: rotate(0deg);
        opacity: 1;
        transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1);
      `;

      document.body.appendChild(particle);

      requestAnimationFrame(() => {
        particle.style.transform = `translate(${destX - startX}px, ${destY - startY}px) rotate(${rotate}deg)`;
        particle.style.opacity = '0';
      });

      setTimeout(() => {
        if (particle.parentNode) particle.parentNode.removeChild(particle);
      }, 1300);
    }
  };

  // ==========================================
  // 9. Numeric Value Tweening Helper
  // ==========================================
  window.tweenNumber = function (el, start, end, duration = 300, formatFn) {
    if (!el) return;
    if (prefersReduced || start === end) {
      el.textContent = formatFn ? formatFn(end) : end;
      return;
    }
    const startTime = performance.now();
    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * ease;
      el.textContent = formatFn ? formatFn(current) : Math.round(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = formatFn ? formatFn(end) : Math.round(end);
      }
    }
    requestAnimationFrame(step);
  };

  // ==========================================
  // 10. Clay.com · Fluid Sliding Pill Navigation Menu
  // ==========================================
  function initNavPill() {
    const nav = document.querySelector('.nav-pill-wrapper') || document.querySelector('#desktop-nav');
    if (!nav) return;

    let indicator = nav.querySelector('#nav-pill-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'nav-pill-indicator';
      nav.prepend(indicator);
    }

    const links = nav.querySelectorAll('.nav-pill-link, a:not(#nav-pill-indicator)');
    if (links.length === 0) return;

    // Detect active page link based on current path
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    let activeLink = null;

    links.forEach(link => {
      const rawHref = link.getAttribute('href') || '';
      const linkPath = rawHref.split('#')[0].replace(/\/$/, '') || '/';
      if (linkPath === currentPath || (currentPath === '/' && (linkPath === '/' || linkPath === '/index.html'))) {
        activeLink = link;
        link.classList.add('is-active');
      }
    });

    if (!activeLink && links.length > 0) {
      activeLink = nav.querySelector('.is-active') || links[0];
    }

    function movePillTo(target, instant = false) {
      if (!indicator || !target) {
        if (indicator) indicator.style.opacity = '0';
        return;
      }
      const navRect = nav.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const left = targetRect.left - navRect.left;
      const width = targetRect.width;

      if (width <= 0) return;

      if (instant || prefersReduced) {
        const prevTransition = indicator.style.transition;
        indicator.style.transition = 'none';
        indicator.style.width = `${width}px`;
        indicator.style.transform = `translate3d(${left}px, 0, 0)`;
        indicator.style.opacity = '1';
        if (!prefersReduced) {
          requestAnimationFrame(() => {
            indicator.style.transition = prevTransition || '';
          });
        }
      } else {
        indicator.style.width = `${width}px`;
        indicator.style.transform = `translate3d(${left}px, 0, 0)`;
        indicator.style.opacity = '1';
      }
    }

    links.forEach(link => {
      link.addEventListener('mouseenter', () => movePillTo(link));
      link.addEventListener('focus', () => movePillTo(link));
    });

    nav.addEventListener('mouseleave', () => {
      movePillTo(activeLink);
    });

    window.addEventListener('resize', () => {
      movePillTo(activeLink, true);
    }, { passive: true });

    // Initial position after render
    setTimeout(() => {
      movePillTo(activeLink, true);
    }, 60);
  }

  // ==========================================
  // 11. Upscayl.org · Interactive Before/After Comparison Slider
  // ==========================================
  function initComparisonSlider() {
    const containers = document.querySelectorAll('.comparison-slider-container');
    containers.forEach(container => {
      const handle = container.querySelector('.comparison-drag-handle');
      if (!handle) return;

      let isDragging = false;

      function setPosition(percent) {
        const clamped = Math.min(95, Math.max(5, percent));
        container.style.setProperty('--split-pos', `${clamped}%`);
        handle.setAttribute('aria-valuenow', Math.round(clamped).toString());
      }

      function updateFromPointer(clientX) {
        const rect = container.getBoundingClientRect();
        if (rect.width <= 0) return;
        const offsetX = clientX - rect.left;
        const percent = (offsetX / rect.width) * 100;
        setPosition(percent);
      }

      handle.addEventListener('pointerdown', (e) => {
        isDragging = true;
        handle.setPointerCapture(e.pointerId);
        container.classList.add('is-dragging');
        e.preventDefault();
      });

      handle.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        updateFromPointer(e.clientX);
      });

      function onPointerEnd(e) {
        if (isDragging) {
          isDragging = false;
          container.classList.remove('is-dragging');
          try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
        }
      }

      handle.addEventListener('pointerup', onPointerEnd);
      handle.addEventListener('pointercancel', onPointerEnd);

      // Keyboard navigation for accessibility
      handle.setAttribute('tabindex', '0');
      handle.setAttribute('role', 'slider');
      handle.setAttribute('aria-label', 'Comparison slider');
      handle.setAttribute('aria-valuemin', '5');
      handle.setAttribute('aria-valuemax', '95');
      handle.setAttribute('aria-valuenow', '50');

      handle.addEventListener('keydown', (e) => {
        const current = parseFloat(getComputedStyle(container).getPropertyValue('--split-pos')) || 50;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          setPosition(current - 5);
          e.preventDefault();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          setPosition(current + 5);
          e.preventDefault();
        }
      });

      // Quick preset buttons if present
      const wrapper = container.closest('section') || container.parentElement;
      if (wrapper) {
        const presets = wrapper.querySelectorAll('[data-slider-set]');
        presets.forEach(btn => {
          btn.addEventListener('click', () => {
            const targetPos = parseFloat(btn.getAttribute('data-slider-set'));
            if (!isNaN(targetPos)) {
              presets.forEach(b => {
                b.classList.remove('bg-brand-600', 'text-white');
                b.classList.add('bg-white', 'text-slate-700');
              });
              btn.classList.add('bg-brand-600', 'text-white');
              btn.classList.remove('bg-white', 'text-slate-700');
              setPosition(targetPos);
            }
          });
        });
      }
    });
  }

  // ==========================================
  // 12. PayPal.com · Live Wallet Balance & Deduction Card
  // ==========================================
  function initCreditWalletSimulator() {
    const sim = document.getElementById('creditWalletSim');
    if (!sim) return;

    const balanceNumEl = sim.querySelector('#walletBalanceNumber');
    const currencyValEl = sim.querySelector('#walletCurrencyVal');
    const deductTagEl = sim.querySelector('#walletDeductTag');
    const ledgerListEl = sim.querySelector('#walletLedgerList');
    const resetBtn = sim.querySelector('#walletResetBtn');
    const taskButtons = sim.querySelectorAll('.wallet-task-pill');

    const INITIAL_CREDITS = 110000;
    let currentBalance = INITIAL_CREDITS;

    function formatNumber(num) {
      return Math.round(num).toLocaleString('en-US');
    }

    function formatCurrency(credits) {
      const dollars = credits * 0.01;
      return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function updateDisplay(newBalance) {
      const prev = currentBalance;
      currentBalance = Math.max(0, newBalance);
      if (window.tweenNumber && balanceNumEl) {
        window.tweenNumber(balanceNumEl, prev, currentBalance, 400, formatNumber);
      } else if (balanceNumEl) {
        balanceNumEl.textContent = formatNumber(currentBalance);
      }
      if (currencyValEl) {
        currencyValEl.textContent = formatCurrency(currentBalance);
      }
    }

    taskButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const cost = parseInt(btn.getAttribute('data-deduct-credits') || '0', 10);
        const taskName = btn.getAttribute('data-deduct-task') || 'Task execution';
        if (cost <= 0) return;

        if (currentBalance < cost) {
          if (balanceNumEl && balanceNumEl.parentElement) {
            balanceNumEl.parentElement.classList.add('animate-pulse');
            setTimeout(() => balanceNumEl.parentElement.classList.remove('animate-pulse'), 800);
          }
          return;
        }

        const newBal = currentBalance - cost;

        // Floating deduction badge
        if (deductTagEl) {
          deductTagEl.textContent = `-${formatNumber(cost)} cr`;
          deductTagEl.classList.remove('is-animating');
          void deductTagEl.offsetWidth; // trigger reflow
          deductTagEl.classList.add('is-animating');
        }

        // Update balance
        updateDisplay(newBal);

        // Append to ledger list
        if (ledgerListEl) {
          const now = new Date();
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const row = document.createElement('div');
          row.className = 'flex items-center justify-between py-2 border-b border-slate-800/80 text-xs text-slate-300';
          row.innerHTML = `
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span class="font-medium text-slate-200">${taskName}</span>
              <span class="text-[10px] text-slate-500 font-mono">${timeStr}</span>
            </div>
            <span class="font-mono font-bold text-rose-400">-${formatNumber(cost)} cr</span>
          `;
          ledgerListEl.prepend(row);

          // Keep max 5 entries
          while (ledgerListEl.children.length > 5) {
            ledgerListEl.removeChild(ledgerListEl.lastChild);
          }
        }
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        updateDisplay(INITIAL_CREDITS);
        if (ledgerListEl) {
          ledgerListEl.innerHTML = `
            <div class="py-2 text-xs text-slate-500 italic text-center">
              Credit pack renewed: 110,000 credits available ($1,100.00 USD).
            </div>
          `;
        }
      });
    }
  }

  // ==========================================
  // 13. Antigravity.google · 3D Card Tilt Physics
  // ==========================================
  function initTilt3D() {
    if (prefersReduced) return;
    const cards = document.querySelectorAll('.tilt-card-3d');

    cards.forEach(card => {
      const maxTilt = parseFloat(card.getAttribute('data-tilt-max') || '6');

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const tiltX = -y * maxTilt;
        const tiltY = x * maxTilt;
        card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(6px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
      });
    });
  }

  // ==========================================
  // 14. Gumloop.com & Kimi Work · Node Workflow Canvas
  // ==========================================
  function initWorkflowCanvas() {
    const canvas = document.querySelector('.workflow-canvas-container');
    if (!canvas) return;

    const nodes = canvas.querySelectorAll('.workflow-node');
    const pulsePaths = canvas.querySelectorAll('.flow-path-pulse');

    nodes.forEach(node => {
      node.addEventListener('mouseenter', () => {
        const downstream = node.getAttribute('data-downstream') || '';
        const downstreamIds = downstream.split(',').map(s => s.trim()).filter(Boolean);

        nodes.forEach(n => {
          const id = n.getAttribute('data-node-id');
          if (n === node || downstreamIds.includes(id)) {
            n.classList.add('node-highlighted');
          } else {
            n.style.opacity = '0.55';
          }
        });

        pulsePaths.forEach(path => {
          path.style.stroke = '#2563eb';
          path.style.strokeWidth = '3.5';
          path.style.animationDuration = '0.8s';
        });
      });

      node.addEventListener('mouseleave', () => {
        nodes.forEach(n => {
          n.classList.remove('node-highlighted');
          n.style.opacity = '1';
        });

        pulsePaths.forEach(path => {
          path.style.stroke = '';
          path.style.strokeWidth = '';
          path.style.animationDuration = '';
        });
      });
    });
  }

  // ==========================================
  // Initialize Everything on DOMContentLoaded
  // ==========================================
  function initAll() {
    initProgressBar();
    initSpotlight();
    initScrollReveals();
    initCounters();
    initBackToTop();
    initLiveTaskSimulation();
    initPillTabs();
    initNavPill();
    initComparisonSlider();
    initCreditWalletSimulator();
    initTilt3D();
    initWorkflowCanvas();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
