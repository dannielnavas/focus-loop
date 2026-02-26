import { installDesktopApi } from './tauri-desktop-api';

function isTauri(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as { __TAURI__?: unknown; __TAURI_INTERNALS__?: unknown };
  return Boolean(w.__TAURI__ ?? w.__TAURI_INTERNALS__);
}

/**
 * When running inside Tauri desktop, replace global fetch with the plugin's fetch
 * so API requests bypass CORS (they go through the native client).
 */
async function patchFetchForTauri(): Promise<void> {
  if (!isTauri()) return;
  const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
  (window as unknown as { fetch: typeof globalThis.fetch }).fetch = tauriFetch as typeof fetch;
}

/**
 * Initialize desktop: patch fetch for API (avoid CORS in installed app), then install desktopAPI.
 */
export async function initDesktop(): Promise<void> {
  await patchFetchForTauri();
  await installDesktopApi();
}
