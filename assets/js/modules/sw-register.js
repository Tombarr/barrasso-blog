/**
 * Service Worker Registration Module
 *
 * Handles registration and lifecycle of the service worker
 */

/**
 * Register the service worker
 */
export function initServiceWorker() {
  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    return;
  }

  // Wait for page to load before registering
  window.addEventListener('load', () => {
    registerServiceWorker();
  });
}

/**
 * Register the service worker and handle updates
 */
async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    // Check for updates on page load
    registration.update();

    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      newWorker.addEventListener('statechange', () => {
        if (
          newWorker.state === 'installed' &&
          navigator.serviceWorker.controller
        ) {
          // New service worker available - show update notification
          showUpdateNotification(newWorker);
        }
      });
    });

    // Listen for controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  } catch (error) {
    console.error('[SW] Registration failed:', error);
  }
}

/**
 * Show notification when update is available
 */
function showUpdateNotification(worker) {
  // Check if user wants to see update notifications
  const showNotification = localStorage.getItem('sw-show-updates') !== 'false';

  if (!showNotification) {
    // Auto-update without notification
    worker.postMessage({ type: 'SKIP_WAITING' });
    return;
  }

  // Create update notification banner
  const banner = document.createElement('div');
  banner.id = 'sw-update-banner';
  banner.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--color-hbg-dark, #1c2b33);
      color: var(--color-ht, #e2e8f0);
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      max-width: 400px;
      font-size: 0.875rem;
      line-height: 1.5;
      border: 1px solid rgba(255,255,255,0.1);
    ">
      <p style="margin: 0 0 0.75rem 0; font-weight: 500;">
        New version available!
      </p>
      <div style="display: flex; gap: 0.5rem;">
        <button id="sw-update-btn" style="
          background: var(--color-hc, #f59e0b);
          color: var(--color-hbg, #1c2b33);
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.875rem;
        ">
          Update Now
        </button>
        <button id="sw-dismiss-btn" style="
          background: transparent;
          color: var(--color-ht, #e2e8f0);
          border: 1px solid rgba(255,255,255,0.2);
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
        ">
          Dismiss
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(banner);

  // Handle update button click
  document.getElementById('sw-update-btn').addEventListener('click', () => {
    worker.postMessage({ type: 'SKIP_WAITING' });
    banner.remove();
  });

  // Handle dismiss button click
  document.getElementById('sw-dismiss-btn').addEventListener('click', () => {
    banner.remove();
  });
}

/**
 * Get cache information (for debugging)
 */
export async function getCacheInfo() {
  if (!navigator.serviceWorker.controller) {
    return null;
  }

  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();

    messageChannel.port1.onmessage = (event) => {
      resolve(event.data);
    };

    navigator.serviceWorker.controller.postMessage({ type: 'GET_CACHE_SIZE' }, [
      messageChannel.port2,
    ]);
  });
}

/**
 * Clear service worker cache (for debugging)
 */
export async function clearCache() {
  if (!navigator.serviceWorker.controller) {
    return;
  }

  navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
}

// Expose functions to window for console debugging
if (typeof window !== 'undefined') {
  window.swDebug = {
    getCacheInfo,
    clearCache,
  };
}
