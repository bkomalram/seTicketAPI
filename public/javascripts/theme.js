(function () {
  'use strict';
  var key = 'lotomanager-theme';
  var root = document.documentElement;
  var theme = 'light';
  try { if (localStorage.getItem(key) === 'dark') theme = 'dark'; } catch (_) {}
  root.dataset.theme = theme;
  function refreshButtons() {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (button) {
      var dark = root.dataset.theme === 'dark';
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? 'Cambiar a modo claro' : 'Cambiar a modo nocturno');
      button.title = dark ? 'Cambiar a modo claro' : 'Cambiar a modo nocturno';
      button.querySelector('span').textContent = dark ? 'Modo claro' : 'Modo nocturno';
      button.querySelector('svg').innerHTML = dark
        ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>'
        : '<path d="M20.5 13.5A9 9 0 0 1 10.5 3a9 9 0 1 0 10 10.5Z"/>';
    });
  }
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.workspace-header, .mobile-header, .mobile-sale-title, .login-card .brand').forEach(function (header) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'theme-toggle';
      button.setAttribute('data-theme-toggle', '');
      button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"></svg><span></span>';
      button.addEventListener('click', function () {
        root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem(key, root.dataset.theme); } catch (_) {}
        refreshButtons();
      });
      header.appendChild(button);
    });
    refreshButtons();
  });
  window.addEventListener('storage', function (event) {
    if (event.key === key) { root.dataset.theme = event.newValue === 'dark' ? 'dark' : 'light'; refreshButtons(); }
  });
})();
