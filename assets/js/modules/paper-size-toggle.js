// Paper size toggle functionality for resume pages
// Manages Letter vs A4 paper size selection and persists preference to localStorage

const STORAGE_KEY = 'resume-paper-size';
const SIZE_LETTER = 'letter';
const SIZE_A4 = 'a4';

// US and Canadian timezones (use Letter paper)
const LETTER_TIMEZONES = [
  // United States
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Phoenix', 'America/Anchorage', 'America/Honolulu',
  'America/Detroit', 'America/Indianapolis', 'America/Kentucky/Louisville',
  'America/Kentucky/Monticello', 'America/Indiana/Indianapolis', 'America/Indiana/Knox',
  'America/Indiana/Marengo', 'America/Indiana/Petersburg', 'America/Indiana/Tell_City',
  'America/Indiana/Vevay', 'America/Indiana/Vincennes', 'America/Indiana/Winamac',
  'America/Juneau', 'America/Nome', 'America/Yakutat', 'America/Sitka',
  'America/Metlakatla', 'America/Boise', 'America/Shiprock',
  'America/North_Dakota/Center', 'America/North_Dakota/New_Salem',
  'America/North_Dakota/Beulah', 'America/Menominee', 'America/St_Thomas',
  // Canada
  'America/Toronto', 'America/Montreal', 'America/Vancouver', 'America/Edmonton',
  'America/Winnipeg', 'America/Halifax', 'America/St_Johns',
  'America/Regina', 'America/Iqaluit', 'America/Pangnirtung',
  'America/Resolute', 'America/Rankin_Inlet', 'America/Cambridge_Bay',
  'America/Yellowknife', 'America/Inuvik', 'America/Whitehorse',
  'America/Dawson', 'America/Creston', 'America/Fort_Nelson',
  'America/Glace_Bay', 'America/Goose_Bay', 'America/Moncton',
  'America/Blanc-Sablon', 'America/Atikokan', 'America/Thunder_Bay',
  'America/Nipigon', 'America/Rainy_River', 'America/Swift_Current'
];

/**
 * Detect default paper size based on user's timezone
 * Returns 'letter' for US/Canada, 'a4' for rest of world
 */
function detectDefaultPaperSize() {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return LETTER_TIMEZONES.includes(timezone) ? SIZE_LETTER : SIZE_A4;
  } catch (e) {
    // Fallback to Letter if detection fails
    console.warn('Could not detect timezone, defaulting to Letter size');
    return SIZE_LETTER;
  }
}

/**
 * Get the current paper size preference
 * Priority: localStorage > timezone detection > default (letter)
 */
function getPaperSizePreference() {
  // Check localStorage first
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && (stored === SIZE_LETTER || stored === SIZE_A4)) {
    return stored;
  }

  // Detect based on timezone
  return detectDefaultPaperSize();
}

/**
 * Apply paper size to the resume container
 */
function applyPaperSize(size) {
  const container = document.querySelector('.resume-container');
  const select = document.getElementById('paper-size-select');

  if (container) {
    container.setAttribute('data-paper-size', size);
  }

  if (select) {
    select.value = size;
  }
}

/**
 * Handle paper size change from select dropdown
 */
function handlePaperSizeChange(event) {
  const newSize = event.target.value;

  // Validate size
  if (newSize !== SIZE_LETTER && newSize !== SIZE_A4) {
    console.warn('Invalid paper size:', newSize);
    return;
  }

  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, newSize);

  // Apply the change
  applyPaperSize(newSize);

  // Dispatch custom event for paper size changes
  document.dispatchEvent(new CustomEvent('paperSizeChanged', {
    detail: { size: newSize }
  }));
}

function doPrint(e) {
  e.preventDefault();
  return window.print();
}

/**
 * Initialize paper size toggle on resume pages
 * Only runs if resume elements are present
 */
export function initPaperSizeToggle() {
  // Only initialize on resume pages
  const resumeContainer = document.querySelector('.resume-container');
  const paperSizeSelect = document.getElementById('paper-size-select');
  const printButtons = Array.from(document.querySelectorAll('[data-action="print"]'));
  printButtons.forEach((button) =>
    button.addEventListener('click', doPrint)
  );


  if (!resumeContainer || !paperSizeSelect) {
    // Not a resume page, skip initialization
    return;
  }

  // Get and apply initial paper size
  const paperSize = getPaperSizePreference();
  applyPaperSize(paperSize);

  // Set up select dropdown listener
  paperSizeSelect.addEventListener('change', handlePaperSizeChange);
}
