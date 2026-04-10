# Synology Photos Upload Guard

A small Chrome extension (Manifest V3) that warns you before closing or leaving the tab while **Synology Photos** is uploading files. It only reacts to requests that hit the **`SYNO.Foto.Upload.Item`** API, so normal background polling does not trigger the prompt.

## How it works

1. **`content.js`** runs at `document_start`. It injects **`inject.js`** only when the URL looks like **Synology Photos** (`launchApp` contains `SYNO.Foto`, e.g. `SYNO.Foto.AppInstance`, or the hash contains `SYNO.Foto`). Other sites only run the tiny check and do not patch networking.
2. **`inject.js`** runs in the page’s main world (same `fetch` / `XMLHttpRequest` as Photos) and wraps those APIs. In-flight **POST**/**PUT** requests whose URL includes `SYNO.Foto.Upload.Item` arm a `beforeunload` handler until they finish.

Open DevTools → Console while uploading to see log lines prefixed with `[Synology Protector]` (tripwire armed / disarmed).

## Install (unpacked)

1. Clone or download this folder.
2. In Chrome (or Chromium-based browsers), open `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select this directory (the one containing `manifest.json`).

After you change any file, use **Reload** on the extension card on `chrome://extensions/`.

## Optional hardening

- **`manifest.json` — `matches`:** Defaults to `*://*/*` so the repo needs **no** hostname or IP. The Photos URL gate in `content.js` is what keeps `inject.js` off normal websites. If you prefer the content script to run only on your DSM origin, change `matches` (and `web_accessible_resources` → `matches`) to something like `https://YOUR-NAS:5001/*` **on your machine only** and avoid committing that if you do not want the address in git history.
- **API string:** If DSM renames the API, update the `SYNO.Foto.Upload.Item` check in `inject.js` from the Network tab.

## Privacy note

A LAN IP or personal hostname in `manifest.json` is easy to leak if you push to a public repo. This project keeps **no** NAS address in the tracked manifest; optional narrowing is your local choice.

## Limitations

- Browsers control the exact **beforeunload** dialog text; some versions show a generic message only.
- This does not stop navigation from other extensions or from the browser closing entirely in all cases; it reduces accidental tab closes during uploads.

## License

Use and modify freely for personal use.
