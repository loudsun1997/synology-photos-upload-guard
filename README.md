# Synology Photos Upload Guard

A small Chrome extension (Manifest V3) that warns you before closing or leaving the tab while **Synology Photos** is uploading files. It only reacts to requests that hit the **`SYNO.Foto.Upload.Item`** API, so normal background polling does not trigger the prompt.

## How it works

1. **`content.js`** runs at `document_start`. It injects **`inject.js`** only when the URL looks like **Synology Photos** (`launchApp` contains `SYNO.Foto`, e.g. `SYNO.Foto.AppInstance`, or the hash contains `SYNO.Foto`). If you add a local **`synology-local.json`** (see below), injection also requires **`window.location.origin`** to be listed there so it only runs on your DSM host/port. Without that file, only the Photos URL check applies (fine for generic clones).
2. **`inject.js`** runs in the page’s main world (same `fetch` / `XMLHttpRequest` as Photos) and wraps those APIs. In-flight **POST**/**PUT** requests whose URL includes `SYNO.Foto.Upload.Item` arm a `beforeunload` handler until they finish.

Open DevTools → Console while uploading to see log lines prefixed with `[Synology Protector]` (tripwire armed / disarmed).

## Install (unpacked)

1. Clone or download this folder.
2. In Chrome (or Chromium-based browsers), open `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select this directory (the one containing `manifest.json`).

After you change any file, use **Reload** on the extension card on `chrome://extensions/`.

## Lock to your NAS (not committed)

1. Copy **`synology-local.json.example`** → **`synology-local.json`** in this folder.
2. Replace the placeholders with your real DSM **origins** (scheme + host + port, no path). The string must match the browser address bar exactly.
3. Reload the extension.

**HTTP vs HTTPS on a local NAS:** Synology DSM’s **defaults** are usually **HTTP on port 5000** and **HTTPS on port 5001** (you can change this in DSM). A LAN IP can still use `https://…`—it is often a **self-signed certificate**, which Chrome may warn about until you accept it. If you open DSM with `http://10.0.0.210:5000`, put that origin in `allowedOrigins`; if you use `https://10.0.0.210:5001`, use that. You can list **both** in the array if you use either depending on the day.

**`synology-local.json` is gitignored** so your IP or hostname is not pushed. The tracked repo only ships the `.example` file.

With this file present, **`inject.js` loads only** when both are true: **Synology Photos** URL signals (`SYNO.Foto`) **and** your tab’s origin is in `allowedOrigins`. You can list multiple origins (QuickConnect + LAN) as separate strings in the array.

## Optional hardening

- **`manifest.json` — `matches`:** Still defaults to `*://*/*` so nothing sensitive is in git. That only controls where the **content script** starts (lightweight); **`synology-local.json`** is the recommended way to restrict **injection** to your NAS without committing addresses. You may still narrow `matches` locally if you want fewer pages to run `content.js` at all—use **`git update-index --skip-worktree manifest.json`** if you edit `manifest.json` with a private IP and do not want to commit it by mistake.
- **API string:** If DSM renames the API, update the `SYNO.Foto.Upload.Item` check in `inject.js` from the Network tab.

## Privacy note

Do not commit **`synology-local.json`**. Prefer the example + local copy pattern above instead of putting your LAN IP or hostname in tracked `manifest.json`.

## Limitations

- Browsers control the exact **beforeunload** dialog text; some versions show a generic message only.
- This does not stop navigation from other extensions or from the browser closing entirely in all cases; it reduces accidental tab closes during uploads.

## License

Use and modify freely for personal use.
