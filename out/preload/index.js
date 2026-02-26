"use strict";
const electron = require("electron");
const desktopAPI = {
  resizeWindow: (width, height) => electron.ipcRenderer.invoke("resize_window", width, height),
  resetWindowSize: () => electron.ipcRenderer.invoke("reset_window_size"),
  makeWindowFloating: (width, height) => electron.ipcRenderer.invoke("make_window_floating", width, height),
  resetWindowFloating: () => electron.ipcRenderer.invoke("reset_window_floating"),
  moveWindow: (x, y) => electron.ipcRenderer.invoke("move_window", x, y),
  hideTitlebar: () => electron.ipcRenderer.invoke("hide_titlebar"),
  showTitlebar: () => electron.ipcRenderer.invoke("show_titlebar"),
  showNotification: (title, body) => electron.ipcRenderer.invoke("show_notification", title, body),
  hideNotification: () => Promise.resolve(true),
  hideMenu: () => electron.ipcRenderer.invoke("hide_menu"),
  showMenu: () => electron.ipcRenderer.invoke("show_menu"),
  updateMenuWithUserData: (userContext) => electron.ipcRenderer.invoke("set_user_context", userContext ?? null),
  onMenuGenerateDaily: (cb) => {
    electron.ipcRenderer.on("menu:generateDaily", () => cb());
  },
  onMenuProfile: (cb) => {
    electron.ipcRenderer.on("menu:profile", () => cb());
  },
  onMenuLogout: (cb) => {
    electron.ipcRenderer.on("menu:logout", () => cb());
  },
  onMenuAbout: (cb) => {
    electron.ipcRenderer.on("menu:about", () => cb());
  }
};
electron.contextBridge.exposeInMainWorld("desktopAPI", desktopAPI);
