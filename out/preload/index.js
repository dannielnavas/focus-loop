"use strict";
const electron = require("electron");
const desktopAPI = {
  resizeWindow: (width, height) => electron.ipcRenderer.invoke("resize_window", width, height),
  resetWindowSize: () => electron.ipcRenderer.invoke("reset_window_size"),
  makeWindowFloating: (width, height, x, y) => electron.ipcRenderer.invoke("make_window_floating", width, height, x, y),
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
  },
  openPassBreakWindow: (ctx) => electron.ipcRenderer.invoke("open_pass_break_window", ctx),
  getPassBreakContext: () => electron.ipcRenderer.invoke("get_pass_break_context"),
  closePassBreakWindow: () => electron.ipcRenderer.invoke("close_pass_break_window"),
  passBreakFlowComplete: (payload) => electron.ipcRenderer.invoke("pass_break_flow_complete", payload),
  passBreakFlowCancel: () => electron.ipcRenderer.invoke("pass_break_flow_cancel"),
  passBreakDurationChosen: (minutes) => electron.ipcRenderer.invoke("pass_break_duration_chosen", { minutes }),
  onPassBreakDurationChosen: (cb) => {
    const fn = (_, payload) => cb(payload);
    electron.ipcRenderer.on("pass-break-duration-chosen", fn);
    return () => {
      electron.ipcRenderer.removeListener("pass-break-duration-chosen", fn);
    };
  },
  onPassBreakFlowDone: (cb) => {
    const fn = (_, payload) => cb(payload);
    electron.ipcRenderer.on("pass-break-flow-done", fn);
    return () => {
      electron.ipcRenderer.removeListener("pass-break-flow-done", fn);
    };
  }
};
electron.contextBridge.exposeInMainWorld("desktopAPI", desktopAPI);
