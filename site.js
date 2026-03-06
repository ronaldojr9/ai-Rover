(function () {
  const nav = document.querySelector('nav');
  const toggle = document.querySelector('.nav-toggle');
  if (!nav || !toggle) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('.nav-links > li > a').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (window.innerWidth > 768) return;
      const parent = link.parentElement;
      const dropdown = parent && parent.querySelector('.nav-dropdown');
      if (!dropdown) return;
      event.preventDefault();
      parent.classList.toggle('open');
    });
  });

  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target)) {
      nav.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      nav.querySelectorAll('.nav-links li.open').forEach((li) => li.classList.remove('open'));
    }
  });
})();
