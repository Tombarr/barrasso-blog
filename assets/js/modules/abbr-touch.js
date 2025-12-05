/**
 * ABBR Tooltip Touch Handler
 * Enables tap-to-show/hide tooltips on touch devices
 */

export function initAbbrTouch() {
  // Only initialize on touch devices
  if (!("ontouchstart" in window)) {
    return;
  }

  document.querySelectorAll(".abbr-tooltip").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Remove active from all other tooltips
      document.querySelectorAll(".abbr-tooltip.active").forEach((other) => {
        if (other !== el) {
          other.classList.remove("active");
        }
      });

      // Toggle this tooltip
      el.classList.toggle("active");
    });
  });

  // Close tooltips when tapping outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".abbr-tooltip")) {
      document.querySelectorAll(".abbr-tooltip.active").forEach((el) => {
        el.classList.remove("active");
      });
    }
  });
}
