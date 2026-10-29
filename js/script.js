(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.addEventListener('load', () => {
    window.setTimeout(() => $('.loader')?.classList.add('loaded'), reducedMotion ? 0 : 450);
  });

  const header = $('#site-header');
  const progress = $('.scroll-progress span');
  const navLinks = $$('.nav-link');
  const sections = $$('main section[id]');

  const updateScrollUi = () => {
    const scrollTop = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    header?.classList.toggle('scrolled', scrollTop > 20);
    if (progress) progress.style.width = `${scrollable > 0 ? (scrollTop / scrollable) * 100 : 0}%`;

    let current = 'home';
    sections.forEach((section) => {
      if (scrollTop >= section.offsetTop - 180) current = section.id;
    });
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${current}`));
  };
  window.addEventListener('scroll', updateScrollUi, { passive: true });
  updateScrollUi();

  const menuButton = $('.menu-toggle');
  const navMenu = $('#nav-menu');
  const closeMenu = () => {
    menuButton?.classList.remove('active');
    navMenu?.classList.remove('open');
    document.body.classList.remove('menu-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open navigation');
  };
  menuButton?.addEventListener('click', () => {
    const open = !navMenu.classList.contains('open');
    menuButton.classList.toggle('active', open);
    navMenu.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  $$('#nav-menu a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

  if (!reducedMotion) {
    const typing = $('.typing');
    if (typing) {
      const words = JSON.parse(typing.dataset.words || '[]');
      let wordIndex = 0;
      let charIndex = words[0]?.length || 0;
      let deleting = true;
      const type = () => {
        const word = words[wordIndex];
        typing.textContent = word.slice(0, charIndex);
        if (deleting) charIndex -= 1;
        else charIndex += 1;
        if (charIndex < 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          charIndex = 0;
        }
        if (charIndex > words[wordIndex].length) {
          deleting = true;
          window.setTimeout(type, 1300);
          return;
        }
        window.setTimeout(type, deleting ? 42 : 75);
      };
      window.setTimeout(type, 1500);
    }
  }

  const skillData = {
    frontend: { number: '01', label: 'Core stack', title: 'Frontend Engineering', items: [['HTML5 & Semantic Web', 95], ['CSS3 / Sass / Tailwind', 92], ['JavaScript / TypeScript', 88], ['React / Next.js', 85]] },
    backend: { number: '02', label: 'Server side', title: 'Backend Development', items: [['Node.js / Express', 82], ['PHP / Laravel', 80], ['RESTful APIs', 88], ['Authentication & Security', 78]] },
    database: { number: '03', label: 'Data layer', title: 'Database Systems', items: [['MySQL', 86], ['MongoDB', 80], ['PostgreSQL', 77], ['Data Modeling', 84]] },
    tools: { number: '04', label: 'Workflow', title: 'Tools & Frameworks', items: [['Git / GitHub', 90], ['Figma / Prototyping', 88], ['Bootstrap / Tailwind', 92], ['Vite / Build Tools', 84]] }
  };
  const panel = $('#skill-panel');
  const animateBars = (scope = panel) => {
    $$('.skill-item', scope).forEach((item, index) => {
      const bar = $('i span', item);
      if (bar) window.setTimeout(() => { bar.style.width = `${item.dataset.level}%`; }, reducedMotion ? 0 : index * 80);
    });
  };
  $$('.skill-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const data = skillData[tab.dataset.skill];
      $$('.skill-tab').forEach((button) => {
        const active = button === tab;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', String(active));
      });
      panel.innerHTML = `<div class="panel-top"><div><span>${data.label}</span><h3>${data.title}</h3></div><span class="panel-number">${data.number}</span></div><div class="skill-list">${data.items.map(([name, level]) => `<div class="skill-item" data-level="${level}"><div><span>${name}</span><b>${level}%</b></div><i><span></span></i></div>`).join('')}</div>`;
      animateBars();
    });
  });

  const skillObserver = new IntersectionObserver((entries, observer) => {
    if (entries[0].isIntersecting) { animateBars(); observer.disconnect(); }
  }, { threshold: .3 });
  if (panel) skillObserver.observe(panel);

  $$('.project-filter button').forEach((button) => {
    button.addEventListener('click', () => {
      $$('.project-filter button').forEach((item) => item.classList.toggle('active', item === button));
      $$('.project-card').forEach((card) => {
        const visible = button.dataset.filter === 'all' || card.dataset.category === button.dataset.filter;
        card.classList.toggle('filtered-out', !visible);
        card.setAttribute('aria-hidden', String(!visible));
      });
    });
  });

  const track = $('.testimonial-track');
  const dots = $$('.slider-dots button');
  let slide = 0;
  let autoplay;
  const showSlide = (index) => {
    slide = (index + dots.length) % dots.length;
    if (track) track.style.transform = `translateX(-${slide * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === slide));
  };
  const startAutoplay = () => {
    if (!reducedMotion) autoplay = window.setInterval(() => showSlide(slide + 1), 6500);
  };
  const moveSlide = (amount) => { window.clearInterval(autoplay); showSlide(slide + amount); startAutoplay(); };
  $('.slider-prev')?.addEventListener('click', () => moveSlide(-1));
  $('.slider-next')?.addEventListener('click', () => moveSlide(1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => { window.clearInterval(autoplay); showSlide(index); startAutoplay(); }));
  startAutoplay();

  const form = $('#contact-form');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    let valid = true;
    $$('input, textarea', form).forEach((field) => {
      const emailInvalid = field.type === 'email' && !/^\S+@\S+\.\S+$/.test(field.value.trim());
      const invalid = !field.value.trim() || emailInvalid;
      field.classList.toggle('invalid', invalid);
      const error = field.parentElement.querySelector('.error');
      if (error) error.textContent = invalid ? (emailInvalid ? 'Enter a valid email address.' : 'This field is required.') : '';
      if (invalid) valid = false;
    });
    const status = $('#form-status');
    if (valid && status) {
      status.textContent = 'Thanks — the form works. Connect a form endpoint to receive messages.';
      status.classList.add('success');
      form.reset();
    }
  });
  $$('input, textarea', form || document).forEach((field) => field.addEventListener('input', () => {
    field.classList.remove('invalid');
    const error = field.parentElement.querySelector('.error');
    if (error) error.textContent = '';
  }));

  $$('a[href="#"]').forEach((link) => link.addEventListener('click', (event) => event.preventDefault()));
  const year = $('#current-year');
  if (year) year.textContent = new Date().getFullYear();
})();
