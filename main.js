// Mobile hamburger menu — toggles a `nav-open` class on <header>, which
// styles.css uses to show/hide the same <nav> element as a dropdown panel
// below 900px (no duplicated link markup, no framework).
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const btn = document.querySelector('.hamburger');
  const nav = header?.querySelector('nav');
  if (!header || !btn || !nav) return;

  const closeMenu = () => { header.classList.remove('nav-open'); btn.setAttribute('aria-expanded', 'false'); };
  const openMenu = () => { header.classList.add('nav-open'); btn.setAttribute('aria-expanded', 'true'); };

  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', 'Menu');
  btn.addEventListener('click', () => {
    header.classList.contains('nav-open') ? closeMenu() : openMenu();
  });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', (e) => {
    if (header.classList.contains('nav-open') && !header.contains(e.target)) closeMenu();
  });
});
