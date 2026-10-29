(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = [...document.querySelectorAll('.reveal')];

  if (reducedMotion) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .1, rootMargin: '0px 0px -45px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  document.querySelectorAll('.ripple').forEach((button) => {
    button.addEventListener('click', (event) => {
      if (reducedMotion) return;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const circle = document.createElement('span');
      circle.className = 'ripple-circle';
      circle.style.width = circle.style.height = `${size}px`;
      circle.style.left = `${event.clientX - rect.left - size / 2}px`;
      circle.style.top = `${event.clientY - rect.top - size / 2}px`;
      button.appendChild(circle);
      circle.addEventListener('animationend', () => circle.remove());
    });
  });

  if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    const cursor = document.querySelector('.cursor-glow');
    window.addEventListener('pointermove', (event) => {
      if (!cursor) return;
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    }, { passive: true });

    document.querySelectorAll('.tilt-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        card.style.transform = `perspective(700px) rotateX(${-y * 5}deg) rotateY(${x * 6}deg) translateY(-3px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    const heroVisual = document.querySelector('.portrait-wrap');
    window.addEventListener('scroll', () => {
      if (heroVisual && window.scrollY < window.innerHeight) heroVisual.style.transform = `translateY(${window.scrollY * .055}px)`;
    }, { passive: true });
  }
})();
