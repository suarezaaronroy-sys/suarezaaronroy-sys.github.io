// assets/js/theme.js
// Apply saved theme and accent to EVERY page

(function() {
  // Read from localStorage
  let theme = localStorage.getItem('theme');
  let accent = localStorage.getItem('accent');

  // If no saved theme, check system preference (optional)
  if (!theme) {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Apply theme (dark / light)
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  // Apply accent color if saved
  if (accent) {
    document.documentElement.style.setProperty('--accent', accent);
  } else {
    // Default accent (terracotta)
    document.documentElement.style.setProperty('--accent', '#C2410C');
  }

  // Store the current values for other scripts to use
  window.__theme = theme;
  window.__accent = accent || '#C2410C';
})();

// Helper function to change theme (call from anywhere)
window.setTheme = function(mode) {
  localStorage.setItem('theme', mode);
  if (mode === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  window.__theme = mode;
};

// Helper function to change accent
window.setAccentColor = function(color) {
  localStorage.setItem('accent', color);
  document.documentElement.style.setProperty('--accent', color);
  window.__accent = color;
};

// Optional: listen for changes from other tabs
window.addEventListener('storage', function(e) {
  if (e.key === 'theme') {
    window.setTheme(e.newValue);
  }
  if (e.key === 'accent') {
    window.setAccentColor(e.newValue);
  }
});
