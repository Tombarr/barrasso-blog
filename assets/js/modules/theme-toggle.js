// Theme toggle functionality
// Manages dark/light mode switching and persists preference to localStorage

const STORAGE_KEY = 'theme-preference';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

/**
 * Get the current theme preference
 * Priority: localStorage > system preference > default (dark)
 */
function getThemePreference() {
  // Check localStorage first
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return stored;
  }

  // Check system preference
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: light)').matches
  ) {
    return THEME_LIGHT;
  }

  // Default to dark
  return THEME_DARK;
}

/**
 * Apply theme to the document
 */
function applyTheme(theme) {
  const htmlElement = document.documentElement;
  const sunIcon = document.getElementById('theme-toggle-sun');
  const moonIcon = document.getElementById('theme-toggle-moon');

  if (theme === THEME_DARK) {
    htmlElement.classList.add('dark');
    if (sunIcon) sunIcon.classList.remove('hidden');
    if (moonIcon) moonIcon.classList.add('hidden');
  } else {
    htmlElement.classList.remove('dark');
    if (sunIcon) sunIcon.classList.add('hidden');
    if (moonIcon) moonIcon.classList.remove('hidden');
  }

  // Dispatch custom event for theme changes
  document.dispatchEvent(
    new CustomEvent('themeChanged', { detail: { theme } }),
  );
}

/**
 * Toggle between dark and light themes
 */
function toggleTheme() {
  const currentTheme = getThemePreference();
  const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;

  localStorage.setItem(STORAGE_KEY, newTheme);
  applyTheme(newTheme);
}

/**
 * Initialize theme on page load
 */
export function initThemeToggle() {
  // Apply initial theme
  const theme = getThemePreference();
  applyTheme(theme);

  // Set up toggle button
  const toggleButton = document.getElementById('theme-toggle');
  if (toggleButton) {
    toggleButton.addEventListener('click', toggleTheme);
  }

  // Listen for system theme changes
  if (window.matchMedia) {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        // Only respond to system changes if user hasn't set a preference
        if (!localStorage.getItem(STORAGE_KEY)) {
          applyTheme(e.matches ? THEME_DARK : THEME_LIGHT);
        }
      });
  }
}
