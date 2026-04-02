/* ============================================================
   SOLVING YOUR MYSTERIES — main.js
   ============================================================ */

(function () {
  'use strict';

  /* ---- NAV: scroll behaviour & mobile toggle -------------- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      nav.classList.toggle('menu-open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        nav.classList.remove('menu-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- REVEAL on scroll ----------------------------------- */
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Small stagger for sibling reveals
          const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal:not(.visible)'));
          const idx = siblings.indexOf(entry.target);
          const delay = Math.min(idx * 80, 400);
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => observer.observe(el));
  } else {
    // Fallback: show everything
    revealElements.forEach(el => el.classList.add('visible'));
  }

  /* ---- REVIEWS CAROUSEL ----------------------------------- */
  const track = document.getElementById('reviewsTrack');
  const prevBtn = document.getElementById('reviewPrev');
  const nextBtn = document.getElementById('reviewNext');
  const dotsContainer = document.getElementById('reviewsDots');

  if (track) {
    const cards = track.querySelectorAll('.review-card');
    let current = 0;
    let autoplayTimer;

    // Build dots
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'review-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Review ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.review-dot');

    function goTo(index) {
      current = (index + cards.length) % cards.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAutoplay(); });

    // Autoplay
    function startAutoplay() {
      autoplayTimer = setInterval(next, 5500);
    }
    function resetAutoplay() {
      clearInterval(autoplayTimer);
      startAutoplay();
    }
    startAutoplay();

    // Touch/swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) {
        dx < 0 ? next() : prev();
        resetAutoplay();
      }
    }, { passive: true });

    // Pause on hover
    track.parentElement.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
    track.parentElement.addEventListener('mouseleave', startAutoplay);
  }

  /* ---- SMOOTH SCROLL for anchor links --------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // nav height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- SMOOTH cross-page anchor links (index.html#enquire) */
  // Handle case where we land on a page with a hash
  if (window.location.hash) {
    setTimeout(() => {
      const target = document.querySelector(window.location.hash);
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 300);
  }

  /* ---- NAV active page highlighting ----------------------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.split('#')[0] === currentPage) {
      link.classList.add('active');
    }
  });

})();


/* ---- ENQUIRY FORM ----------------------------------------- */
(function() {
  const form      = document.getElementById('enquiryForm');
  if (!form) return;

  const successMsg = document.getElementById('formSuccess');

  function showError(inputEl, errorEl) {
    if (inputEl) inputEl.classList.add('invalid');
    if (errorEl) errorEl.classList.add('visible');
  }

  function clearError(inputEl, errorEl) {
    if (inputEl) inputEl.classList.remove('invalid');
    if (errorEl) errorEl.classList.remove('visible');
  }

  function showSuccess() {
    form.style.display = 'none';
    successMsg.style.display = 'block';
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const name    = document.getElementById('fullName');
    const email   = document.getElementById('emailAddress');
    const message = document.getElementById('message');
    let valid = true;

    clearError(name,    document.getElementById('fullNameError'));
    clearError(email,   document.getElementById('emailError'));
    clearError(message, document.getElementById('messageError'));

    if (!name.value.trim()) {
      showError(name, document.getElementById('fullNameError'));
      valid = false;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email.value.trim())) {
      showError(email, document.getElementById('emailError'));
      valid = false;
    }
    if (!message.value.trim()) {
      showError(message, document.getElementById('messageError'));
      valid = false;
    }
    if (!valid) return;

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    const formAction = 'https://docs.google.com/forms/d/e/1FAIpQLSfVKPpZjl_0zv-Wk47fnKc8SmRguX_HL4AveEFc0cr7sef0iA/formResponse';

    const params = new URLSearchParams();
    params.append('entry.227282099', name.value.trim());
    params.append('emailAddress',    email.value.trim());
    params.append('entry.703233908', message.value.trim());

    const iframe = document.createElement('iframe');
    iframe.name = 'hidden-form-target';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const tempForm = document.createElement('form');
    tempForm.method = 'POST';
    tempForm.action = formAction;
    tempForm.target = 'hidden-form-target';
    tempForm.style.display = 'none';

    params.forEach((value, key) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      tempForm.appendChild(input);
    });

    document.body.appendChild(tempForm);

    iframe.onload = function() {
      showSuccess();
      document.body.removeChild(tempForm);
      document.body.removeChild(iframe);
    };

    tempForm.submit();
  });
})();