/**
 * NIV ACESSÓRIOS — INTERAÇÕES & ANIMAÇÕES
 * - Rolagem suave com Lenis
 * - Efeito Parallax na imagem da Hero e Faixa de Citação
 * - Reveal on Scroll fluido com IntersectionObserver
 * - Navegação elegante por Abas
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================
     1. INICIALIZAÇÃO DO LENIS (SMOOTH SCROLL)
     ========================================== */
  let lenis = null;

  if (typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.8,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  /* ==========================================
     2. PARALLAX EXCLUSIVO NA IMAGEM DA HERO
     ========================================== */
  const heroImg = document.querySelector('.hero-img');

  function updateParallax(scrollY) {
    if (heroImg && scrollY <= window.innerHeight * 1.3) {
      const heroOffset = scrollY * 0.36;
      heroImg.style.transform = `scale(1.1) translate3d(0, ${heroOffset.toFixed(1)}px, 0)`;
    }
  }

  if (lenis) {
    lenis.on('scroll', ({ scroll }) => {
      updateParallax(scroll);
    });
  } else {
    window.addEventListener('scroll', () => {
      updateParallax(window.scrollY);
    }, { passive: true });
  }

  // Posição inicial do parallax
  updateParallax(window.scrollY || 0);

  /* ==========================================
     3. ROLAGEM SUAVE PARA ÂNCORAS
     ========================================== */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(targetEl, { offset: 0, duration: 1.3 });
          } else {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });

  /* ==========================================
     4. REVEAL ON SCROLL
     ========================================== */
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  /* ==========================================
     5. CONTROLE DE ABAS COM TRANSIÇÃO AUTOMÁTICA
     ========================================== */
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');

  let currentTabIndex = 0;
  let tabInterval = null;
  const AUTOPLAY_INTERVAL = 3800; // 3.8 segundos por aba

  function switchTab(index) {
    if (tabs.length === 0 || panels.length === 0) return;
    currentTabIndex = (index + tabs.length) % tabs.length;

    const activeTab = tabs[currentTabIndex];
    const targetPanelId = activeTab ? activeTab.getAttribute('aria-controls') : null;

    tabs.forEach((t, i) => {
      const isCurrent = i === currentTabIndex;
      t.classList.remove('is-active');
      t.setAttribute('aria-selected', 'false');
      
      if (isCurrent) {
        // Força reflow para reiniciar animação da barra de progresso
        void t.offsetWidth;
        t.classList.add('is-active');
        t.setAttribute('aria-selected', 'true');
      }
    });

    panels.forEach((panel) => {
      const isMatch = panel.id === targetPanelId;
      panel.hidden = !isMatch;
      panel.classList.toggle('is-active', isMatch);

      if (isMatch) {
        panel.querySelectorAll('.reveal').forEach((rev) => {
          rev.classList.add('is-visible');
        });
      }
    });
  }

  function startTabAutoplay() {
    stopTabAutoplay();
    tabInterval = setInterval(() => {
      switchTab(currentTabIndex + 1);
    }, AUTOPLAY_INTERVAL);
  }

  function stopTabAutoplay() {
    if (tabInterval) {
      clearInterval(tabInterval);
      tabInterval = null;
    }
  }

  // Eventos de clique nas abas
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      switchTab(index);
      startTabAutoplay(); // Reinicia o temporizador após o clique
    });
  });

  // Inicia a rotação automática imediatamente
  switchTab(0);
  startTabAutoplay();
});
