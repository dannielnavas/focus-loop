import { contextBridge, ipcRenderer } from 'electron';

const desktopAPI = {
  resizeWindow: (width: number, height: number) => ipcRenderer.invoke('resize_window', width, height),
  resetWindowSize: () => ipcRenderer.invoke('reset_window_size'),
  makeWindowFloating: (width: number, height: number, x?: number, y?: number) => ipcRenderer.invoke('make_window_floating', width, height, x, y),
  resetWindowFloating: () => ipcRenderer.invoke('reset_window_floating'),
  moveWindow: (x: number, y: number) => ipcRenderer.invoke('move_window', x, y),
  hideTitlebar: () => ipcRenderer.invoke('hide_titlebar'),
  showTitlebar: () => ipcRenderer.invoke('show_titlebar'),
  showNotification: (title: string, body: string) => ipcRenderer.invoke('show_notification', title, body),
  hideNotification: () => Promise.resolve(true),
  hideMenu: () => ipcRenderer.invoke('hide_menu'),
  showMenu: () => ipcRenderer.invoke('show_menu'),
  updateMenuWithUserData: (userContext?: unknown) => ipcRenderer.invoke('set_user_context', userContext ?? null),
  onMenuGenerateDaily: (cb: () => void) => {
    ipcRenderer.on('menu:generateDaily', () => cb());
  },
  onMenuProfile: (cb: () => void) => {
    ipcRenderer.on('menu:profile', () => cb());
  },
  onMenuLogout: (cb: () => void) => {
    ipcRenderer.on('menu:logout', () => cb());
  },
  onMenuAbout: (cb: () => void) => {
    ipcRenderer.on('menu:about', () => cb());
  },
  openPassBreakWindow: (ctx: { taskTitle: string }) =>
    ipcRenderer.invoke('open_pass_break_window', ctx),
  getPassBreakContext: () => ipcRenderer.invoke('get_pass_break_context'),
  closePassBreakWindow: () => ipcRenderer.invoke('close_pass_break_window'),
  passBreakFlowComplete: (payload: { action: 'advance-queue' }) =>
    ipcRenderer.invoke('pass_break_flow_complete', payload),
  passBreakFlowCancel: () => ipcRenderer.invoke('pass_break_flow_cancel'),
  passBreakDurationChosen: (minutes: 5 | 10 | 15) =>
    ipcRenderer.invoke('pass_break_duration_chosen', { minutes }),
  onPassBreakDurationChosen: (cb: (p: { minutes: 5 | 10 | 15 }) => void) => {
    const fn = (_: unknown, payload: { minutes: 5 | 10 | 15 }) => cb(payload);
    ipcRenderer.on('pass-break-duration-chosen', fn);
    return () => {
      ipcRenderer.removeListener('pass-break-duration-chosen', fn);
    };
  },
  onPassBreakFlowDone: (
    cb: (p: { action: 'advance-queue' } | { action: 'cancelled' }) => void
  ) => {
    const fn = (_: unknown, payload: { action: 'advance-queue' } | { action: 'cancelled' }) =>
      cb(payload);
    ipcRenderer.on('pass-break-flow-done', fn);
    return () => {
      ipcRenderer.removeListener('pass-break-flow-done', fn);
    };
  },
  spotifyConnect: () => ipcRenderer.invoke('spotify_connect'),
  spotifyDisconnect: () => ipcRenderer.invoke('spotify_disconnect'),
  spotifyGetStatus: () => ipcRenderer.invoke('spotify_status'),
  spotifyGetNowPlaying: () => ipcRenderer.invoke('spotify_now_playing'),
  openExternalUrl: (url: string) => ipcRenderer.invoke('open_external_url', url),
  onSpotifyAuthResult: (cb: (r: { ok: boolean; error?: string }) => void) => {
    const fn = (_: unknown, payload: { ok: boolean; error?: string }) => cb(payload);
    ipcRenderer.on('spotify-auth-result', fn);
    return () => {
      ipcRenderer.removeListener('spotify-auth-result', fn);
    };
  },
};

contextBridge.exposeInMainWorld('desktopAPI', desktopAPI);
