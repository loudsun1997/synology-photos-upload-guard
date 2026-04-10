// content.js — public repo uses broad manifest matches; we only inject on Synology Photos URLs.

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

if (isSynologyPhotosUrl()) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inject.js');
  script.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}
