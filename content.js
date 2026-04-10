// content.js — inject only on Synology Photos URLs; optional NAS lock via gitignored synology-local.json.

(async function () {
  let allowedOrigins = null;
  try {
    const res = await fetch(chrome.runtime.getURL('synology-local.json'));
    if (res.ok) {
      const cfg = await res.json();
      if (Array.isArray(cfg.allowedOrigins) && cfg.allowedOrigins.length > 0) {
        allowedOrigins = cfg.allowedOrigins;
      }
    }
  } catch {
    /* missing or unreadable config → no origin filter (clone-friendly) */
  }

  function isSynologyPhotosUrl() {
    try {
      const params = new URLSearchParams(window.location.search);
      const launchApp = params.get('launchApp') || '';
      if (launchApp.includes('SYNO.Foto')) return true;
      if (window.location.hash.includes('SYNO.Foto')) return true;
      return false;
    } catch {
      return false;
    }
  }

  function isAllowedOrigin() {
    if (!allowedOrigins) return true;
    return allowedOrigins.includes(window.location.origin);
  }

  if (!isSynologyPhotosUrl() || !isAllowedOrigin()) return;

  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inject.js');
  script.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
})();
