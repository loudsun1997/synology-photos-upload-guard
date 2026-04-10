let activeUploads = 0;

function handleBeforeUnload(event) {
  event.preventDefault();
  event.returnValue = '';
}

function updateTripwire() {
  if (activeUploads > 0) {
    window.addEventListener('beforeunload', handleBeforeUnload);
    console.log(
      `[Synology Protector] Tripwire ARMED. Active uploads: ${activeUploads}`
    );
  } else {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    console.log(
      `[Synology Protector] Tripwire DISARMED. Active uploads: 0`
    );
  }
}

const originalXhrOpen = XMLHttpRequest.prototype.open;
const originalXhrSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function (method, url, ...rest) {
  const isPostOrPut = ['POST', 'PUT'].includes(method.toUpperCase());
  const isTargetUrl =
    url && typeof url === 'string' && url.includes('SYNO.Foto.Upload.Item');

  this._isSynologyUpload = isPostOrPut && isTargetUrl;

  return originalXhrOpen.call(this, method, url, ...rest);
};

XMLHttpRequest.prototype.send = function (...args) {
  if (this._isSynologyUpload) {
    activeUploads++;
    updateTripwire();

    this.addEventListener('loadend', () => {
      activeUploads--;
      updateTripwire();
    });
  }
  return originalXhrSend.apply(this, args);
};

const originalFetch = window.fetch;
window.fetch = async function (...args) {
  const input = args[0];
  const init = args[1];
  const url = input instanceof Request ? input.url : input;
  const method = (
    init?.method ||
    (input instanceof Request ? input.method : undefined) ||
    'GET'
  ).toUpperCase();

  const isPostOrPut = ['POST', 'PUT'].includes(method);
  const isTargetUrl =
    url && typeof url === 'string' && url.includes('SYNO.Foto.Upload.Item');

  const isSynologyUpload = isPostOrPut && isTargetUrl;

  if (isSynologyUpload) {
    activeUploads++;
    updateTripwire();
  }

  try {
    return await originalFetch.apply(this, args);
  } finally {
    if (isSynologyUpload) {
      activeUploads--;
      updateTripwire();
    }
  }
};
