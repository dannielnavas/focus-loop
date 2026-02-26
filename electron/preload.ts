import { contextBridge, ipcRenderer } from 'electron';

const desktopAPI = {
  resizeWindow: (width: number, height: number) => ipcRenderer.invoke('resize_window', width, height),
  resetWindowSize: () => ipcRenderer.invoke('reset_window_size'),
  makeWindowFloating: (width: number, height: number) => ipcRenderer.invoke('make_window_floating', width, height),
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
};

contextBridge.exposeInMainWorld('desktopAPI', desktopAPI);
