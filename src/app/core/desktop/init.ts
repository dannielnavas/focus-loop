/**
 * Initialize desktop: in Electron, desktopAPI is exposed by the preload script.
 * In browser, there is no desktop API (window.desktopAPI is undefined).
 */
export async function initDesktop(): Promise<void> {
  // No-op: Electron preload already set window.desktopAPI; in browser it stays undefined.
}
