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
  const form         = document.getElementById('enquiryForm');
  if (!form) return;

  const page1        = document.getElementById('formPage1');
  const page2        = document.getElementById('formPage2');
  const nextBtn      = document.getElementById('nextBtn');
  const backBtn      = document.getElementById('backBtn');
  const step1        = document.getElementById('stepIndicator1');
  const step2        = document.getElementById('stepIndicator2');
  const successMsg   = document.getElementById('formSuccess');
  const otherCheckbox = document.getElementById('otherCheckbox');
  const otherText    = document.getElementById('otherText');
  const priorRadios  = document.querySelectorAll('input[name="entry.2020990205"]');
  const priorDetail  = document.getElementById('priorResearchDetail');

  // Show/hide "other" text input
  otherCheckbox.addEventListener('change', function() {
    otherText.style.display = this.checked ? 'block' : 'none';
    if (!this.checked) otherText.value = '';
  });

  // Show/hide prior research detail
  priorRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      priorDetail.style.display = this.value === 'Yes' ? 'block' : 'none';
    });
  });

  function showError(inputEl, errorEl) {
    if (inputEl) inputEl.classList.add('invalid');
    if (errorEl) errorEl.classList.add('visible');
  }

  function clearError(inputEl, errorEl) {
    if (inputEl) inputEl.classList.remove('invalid');
    if (errorEl) errorEl.classList.remove('visible');
  }

  function validatePage1() {
    let valid = true;
    const name  = document.getElementById('fullName');
    const email = document.getElementById('emailAddress');

    clearError(name,  document.getElementById('fullNameError'));
    clearError(email, document.getElementById('emailError'));

    if (!name.value.trim()) {
      showError(name, document.getElementById('fullNameError'));
      valid = false;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email.value.trim())) {
      showError(email, document.getElementById('emailError'));
      valid = false;
    }
    return valid;
  }

  function validatePage2() {
    let valid = true;

    // Required text fields
    const textFields = [
      { id: 'mainMystery',  errId: 'mainMysteryError' },
      { id: 'timePeriod',   errId: 'timePeriodError' },
      { id: 'outcome',      errId: 'outcomeError' },
      { id: 'deadline',     errId: 'deadlineError' },
    ];
    textFields.forEach(({ id, errId }) => {
      const el = document.getElementById(id);
      clearError(el, document.getElementById(errId));
      if (!el.value.trim()) {
        showError(el, document.getElementById(errId));
        valid = false;
      }
    });

    // Prior research radio
    const priorChecked = document.querySelector('input[name="entry.2020990205"]:checked');
    clearError(null, document.getElementById('priorResearchError'));
    if (!priorChecked) {
      showError(null, document.getElementById('priorResearchError'));
      valid = false;
    }

    // Documents checkboxes — at least one
    const docChecked = document.querySelectorAll('input[name="entry.1323006018"]:checked');
    clearError(null, document.getElementById('documentsError'));
    if (docChecked.length === 0) {
      showError(null, document.getElementById('documentsError'));
      valid = false;
    }

    // DNA radio
    const dnaChecked = document.querySelector('input[name="entry.88744541"]:checked');
    clearError(null, document.getElementById('dnaError'));
    if (!dnaChecked) {
      showError(null, document.getElementById('dnaError'));
      valid = false;
    }

    // Confirm checkboxes — all three required
    const confirmBoxes   = document.querySelectorAll('.confirm-check');
    const confirmChecked = document.querySelectorAll('.confirm-check:checked');
    clearError(null, document.getElementById('confirmError'));
    if (confirmChecked.length < confirmBoxes.length) {
      showError(null, document.getElementById('confirmError'));
      valid = false;
    }

    return valid;
  }

  // Next button
  nextBtn.addEventListener('click', function() {
    if (!validatePage1()) return;
    page1.classList.remove('active');
    page2.classList.add('active');
    step1.classList.remove('active');
    step2.classList.add('active');
    window.scrollTo({ top: document.getElementById('enquire').offsetTop - 90, behavior: 'smooth' });
  });

  // Back button
  backBtn.addEventListener('click', function() {
    page2.classList.remove('active');
    page1.classList.add('active');
    step2.classList.remove('active');
    step1.classList.add('active');
    window.scrollTo({ top: document.getElementById('enquire').offsetTop - 90, behavior: 'smooth' });
  });

  // Submit
 form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!validatePage2()) return;

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    const formAction = 'https://docs.google.com/forms/d/e/1FAIpQLSfVKPpZjl_0zv-Wk47fnKc8SmRguX_HL4AveEFc0cr7sef0iA/formResponse';

    // Build params manually
    const params = new URLSearchParams();

    // Page 1
    params.append('entry.227282099', document.getElementById('fullName').value.trim());
    params.append('emailAddress',    document.getElementById('emailAddress').value.trim());

    // Page 2 — text fields
    params.append('entry.282346556', document.getElementById('mainMystery').value.trim());
    params.append('entry.558749558', document.getElementById('timePeriod').value.trim());
    params.append('entry.1524088975', document.getElementById('geoArea').value.trim());
    params.append('entry.1848109068', document.getElementById('outcome').value.trim());
    params.append('entry.1891890464', document.getElementById('deadline').value.trim());

    // Prior research radio
    const priorChecked = document.querySelector('input[name="entry.2020990205"]:checked');
    if (priorChecked) params.append('entry.2020990205', priorChecked.value);

    // Prior research detail
    const priorDetailVal = document.getElementById('priorDetail').value.trim();
    if (priorDetailVal) params.append('entry.604685180', priorDetailVal);

    // Documents checkboxes — append one entry per checked box
    document.querySelectorAll('input[name="entry.1323006018"]:checked').forEach(cb => {
      params.append('entry.1323006018', cb.value);
    });
    // Other text if filled
    if (otherCheckbox.checked && otherText.value.trim()) {
      params.append('entry.1323006018.other_option_response', otherText.value.trim());
    }

    // DNA radio
    const dnaChecked = document.querySelector('input[name="entry.88744541"]:checked');
    if (dnaChecked) params.append('entry.88744541', dnaChecked.value);

    // Confirm checkboxes — append one entry per checked box
    document.querySelectorAll('.confirm-check:checked').forEach(cb => {
      params.append('entry.147566616', cb.value);
    });

    console.log('mainMystery:', document.getElementById('mainMystery').value);
    console.log('timePeriod:', document.getElementById('timePeriod').value);
    console.log('params:', params.toString());

    fetch(formAction, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      mode: 'no-cors'
    }).then(() => {
      form.style.display = 'none';
      successMsg.style.display = 'block';
    }).catch(() => {
      form.style.display = 'none';
      successMsg.style.display = 'block';
    });
  });
})();