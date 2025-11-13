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
 * Update PDF download link based on paper size
 */
function updatePdfDownloadLink(size) {
  const downloadButton = document.querySelector('.pdf-download-button');

  if (!downloadButton) return;

  const pdfLetter = downloadButton.getAttribute('data-pdf-letter');
  const pdfA4 = downloadButton.getAttribute('data-pdf-a4');
  const filenameBase = downloadButton.getAttribute('data-filename-base');
  const filenameYear = downloadButton.getAttribute('data-filename-year');

  if (size === SIZE_A4) {
    downloadButton.href = pdfA4;
    downloadButton.setAttribute('download', `${filenameBase}-a4-${filenameYear}.pdf`);
  } else {
    downloadButton.href = pdfLetter;
    downloadButton.setAttribute('download', `${filenameBase}-letter-${filenameYear}.pdf`);
  }
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

  // Update PDF download link to match paper size
  updatePdfDownloadLink(size);
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

  // Recalculate page spacers after paper size change
  // Use setTimeout to allow layout to settle
  setTimeout(() => insertPageSpacers(), 100);
}

function doPrint(e) {
  e.preventDefault();
  return window.print();
}

/**
 * Calculate page break positions and insert visual spacers
 * Creates gaps between pages on screen (hidden in print)
 */
function insertPageSpacers() {
  const container = document.querySelector('.resume-container');
  if (!container) return;

  // Remove existing spacers
  const existingSpacers = container.querySelectorAll('.page-spacer');
  existingSpacers.forEach(spacer => spacer.remove());

  // Get paper size and calculate page height in pixels
  const paperSize = container.getAttribute('data-paper-size') || SIZE_LETTER;

  // Convert to pixels (96 DPI standard)
  // Letter: 11 inches = 1056px, A4: 297mm ≈ 1122px
  const pageHeightPx = paperSize === SIZE_A4
    ? 297 * 3.7795275591  // mm to px conversion
    : 11 * 96;              // inches to px

  // Get total container height
  const containerHeight = container.scrollHeight;

  // Calculate number of page breaks needed
  const numPages = Math.ceil(containerHeight / pageHeightPx);

  if (numPages <= 1) {
    // Single page, no spacers needed
    return;
  }

  // Insert spacers at page boundaries
  for (let page = 1; page < numPages; page++) {
    const breakPosition = page * pageHeightPx;

    // Find the best insertion point near the break position
    const allElements = Array.from(container.querySelectorAll('.resume-header, .resume-content-grid > *, .job-entry, .degree-entry, .project-entry, .sidebar-section'));

    let insertBeforeElement = null;
    let minDistance = Infinity;

    for (const element of allElements) {
      const rect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const elementTop = rect.top - containerRect.top + container.scrollTop;
      const distance = Math.abs(elementTop - breakPosition);

      if (elementTop > breakPosition && distance < minDistance) {
        minDistance = distance;
        insertBeforeElement = element;
      }
    }

    // Create and insert spacer
    if (insertBeforeElement) {
      const spacer = document.createElement('div');
      spacer.className = 'page-spacer screen-only';
      spacer.setAttribute('data-page', page);
      insertBeforeElement.parentNode.insertBefore(spacer, insertBeforeElement);
    }
  }
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

  // Insert page spacers after initial load
  // Wait for layout to settle before calculating positions
  setTimeout(() => insertPageSpacers(), 300);

  // Recalculate spacers on window resize (debounced)
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => insertPageSpacers(), 300);
  });
}
