"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
const electron = require("electron");
const path = require("path");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
const ADMIN_SUBSCRIPTION_PLAN_ID = "2";
const ROLE_ADMIN = "admin";
const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 800;
let mainWindow = null;
let passBreakWindow = null;
let passBreakContext = null;
let userContext = null;
const PASS_BREAK_ROUTE = "/private/timer-pass-break";
function schedulePassBreakNavigation(win) {
  let attempts = 0;
  const maxAttempts = 200;
  const tryNavigate = () => {
    if (win.isDestroyed()) return;
    const path2 = PASS_BREAK_ROUTE;
    void win.webContents.executeJavaScript(
      `(() => {
          if (window.__FL_APP_READY__) {
            window.dispatchEvent(new CustomEvent('electron-navigate', { detail: '${path2}' }));
            return 'done';
          }
          return 'wait';
        })()`
    ).then((result) => {
      if (result === "done") return;
      attempts += 1;
      if (attempts < maxAttempts) {
        setTimeout(tryNavigate, 80);
      } else {
        void win.webContents.executeJavaScript(
          `window.dispatchEvent(new CustomEvent('electron-navigate', { detail: '${path2}' }));`
        ).catch(() => {
        });
      }
    }).catch(() => {
      attempts += 1;
      if (attempts < maxAttempts) setTimeout(tryNavigate, 80);
    });
  };
  setTimeout(tryNavigate, 120);
}
function isAdminUser(user) {
  if (!user) return false;
  if (user.role === ROLE_ADMIN) return true;
  const planId = user.subscriptionPlan?.subscription_plan_id;
  const idStr = planId != null ? String(planId) : "";
  return idStr === ADMIN_SUBSCRIPTION_PLAN_ID;
}
function isRoleAdmin(user) {
  return user?.role === ROLE_ADMIN;
}
function buildApplicationMenu() {
  isAdminUser(userContext);
  const isAdminRole = isRoleAdmin(userContext);
  const isLoggedIn = userContext != null;
  const template = [
    {
      label: "Focus Loop",
      submenu: [
        { label: "About Focus Loop", click: () => showAboutDialog() },
        { type: "separator" },
        { label: "Generate Daily", click: () => mainWindow?.webContents.send("menu:generateDaily") },
        ...isAdminRole ? [{ label: "Profile", click: () => mainWindow?.webContents.send("menu:profile") }] : [],
        ...isLoggedIn ? [{ type: "separator" }, { label: "Logout", click: () => mainWindow?.webContents.send("menu:logout") }] : [],
        { type: "separator" },
        { label: "Quit", role: "quit" }
      ].filter(Boolean)
    }
  ];
  return electron.Menu.buildFromTemplate(template);
}
function showAboutDialog() {
  const version = electron.app.getVersion();
  electron.dialog.showMessageBox(mainWindow, {
    type: "info",
    title: "Focus Loop",
    message: "Focus Loop",
    detail: `Versión ${version}

Developed by Danniel Navas. Focus Loop is a task management and productivity application.`
  }).catch(() => {
  });
}
function getAngularPath() {
  if (electron.app.isPackaged) {
    return path__namespace.join(process.resourcesPath, "app.asar", "dist", "focus-loop", "browser", "index.html");
  }
  return path__namespace.join(__dirname, "../../../dist/focus-loop/browser/index.html");
}
function createWindow() {
  const preloadPath = path__namespace.join(__dirname, "../preload/index.js");
  const isDev = process.env.ELECTRON_RENDERER_URL != null;
  mainWindow = new electron.BrowserWindow({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    title: "Focus Loop",
    resizable: false,
    maximizable: false,
    fullscreen: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: !electron.app.isPackaged
    },
    show: false
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL).catch(() => {
    });
  } else {
    mainWindow.loadFile(getAngularPath()).catch((err) => {
      console.error("Failed to load Angular app:", err);
    });
  }
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
    if (isDev) {
      mainWindow?.webContents.openDevTools({ mode: "detach" });
    }
  });
  applyMenu();
}
function applyMenu() {
  if (!mainWindow) return;
  const menu = buildApplicationMenu();
  electron.Menu.setApplicationMenu(menu);
}
electron.app.whenReady().then(() => {
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
electron.ipcMain.handle("resize_window", async (_, width, height) => {
  try {
    if (mainWindow) {
      mainWindow.setSize(width, height);
      mainWindow.center();
      return true;
    }
    return false;
  } catch {
    return false;
  }
});
electron.ipcMain.handle("reset_window_size", async () => {
  try {
    if (mainWindow) {
      mainWindow.setSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);
      mainWindow.setAlwaysOnTop(false);
      mainWindow.center();
      return true;
    }
    return false;
  } catch {
    return false;
  }
});
electron.ipcMain.handle("make_window_floating", async (_, width, height, x, y) => {
  try {
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(true, "floating");
      mainWindow.setResizable(false);
      mainWindow.setMinimumSize(width, height);
      mainWindow.setMaximumSize(width, height);
      mainWindow.setSize(width, height);
      if (x !== void 0 && y !== void 0) {
        mainWindow.setPosition(x, y);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
});
electron.ipcMain.handle("reset_window_floating", async () => {
  try {
    if (mainWindow) {
      mainWindow.setMinimumSize(0, 0);
      mainWindow.setMaximumSize(0, 0);
      mainWindow.setAlwaysOnTop(false);
      mainWindow.setSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);
      mainWindow.center();
      return true;
    }
    return false;
  } catch {
    return false;
  }
});
electron.ipcMain.handle("move_window", async (_, x, y) => {
  try {
    if (mainWindow) {
      mainWindow.setPosition(x, y);
      return true;
    }
    return false;
  } catch {
    return false;
  }
});
electron.ipcMain.handle("hide_titlebar", async () => {
  try {
    if (mainWindow) {
      mainWindow.setMenuBarVisibility(false);
      mainWindow.setFullScreenable(false);
      return true;
    }
    return false;
  } catch {
    return false;
  }
});
electron.ipcMain.handle("show_titlebar", async () => {
  try {
    if (mainWindow) {
      mainWindow.setMenuBarVisibility(true);
      mainWindow.setFullScreenable(true);
      return true;
    }
    return false;
  } catch {
    return false;
  }
});
electron.ipcMain.handle("hide_menu", async () => {
  try {
    if (mainWindow) mainWindow.setMenu(null);
    return true;
  } catch {
    return false;
  }
});
electron.ipcMain.handle("show_menu", async () => {
  try {
    applyMenu();
    return true;
  } catch {
    return false;
  }
});
electron.ipcMain.handle("set_user_context", async (_, user_context) => {
  try {
    userContext = user_context ?? null;
    applyMenu();
    return true;
  } catch {
    return false;
  }
});
electron.ipcMain.handle("open_pass_break_window", async (_, ctx) => {
  try {
    if (!mainWindow || mainWindow.isDestroyed()) return false;
    passBreakContext = ctx;
    if (passBreakWindow && !passBreakWindow.isDestroyed()) {
      passBreakWindow.focus();
      schedulePassBreakNavigation(passBreakWindow);
      return true;
    }
    const preloadPath = path__namespace.join(__dirname, "../preload/index.js");
    const isDev = process.env.ELECTRON_RENDERER_URL != null;
    passBreakWindow = new electron.BrowserWindow({
      width: 520,
      height: 480,
      minWidth: 400,
      minHeight: 380,
      title: "Pasar tarea — Focus Loop",
      parent: mainWindow,
      modal: true,
      resizable: true,
      minimizable: false,
      maximizable: false,
      fullscreen: false,
      show: false,
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
        webSecurity: !electron.app.isPackaged
      }
    });
    passBreakWindow.on("closed", () => {
      passBreakWindow = null;
      passBreakContext = null;
      notifyMainPassBreakResult({ action: "cancelled" });
    });
    if (isDev && process.env.ELECTRON_RENDERER_URL) {
      const base = process.env.ELECTRON_RENDERER_URL.replace(/\/?$/, "/");
      await passBreakWindow.loadURL(base);
      schedulePassBreakNavigation(passBreakWindow);
    } else {
      passBreakWindow.webContents.once("did-finish-load", () => {
        schedulePassBreakNavigation(passBreakWindow);
      });
      await passBreakWindow.loadFile(getAngularPath());
    }
    passBreakWindow.once("ready-to-show", () => {
      passBreakWindow?.show();
    });
    return true;
  } catch (e) {
    console.error("open_pass_break_window", e);
    return false;
  }
});
electron.ipcMain.handle("get_pass_break_context", async () => passBreakContext);
electron.ipcMain.handle(
  "pass_break_duration_chosen",
  async (_, payload) => {
    try {
      const win = passBreakWindow;
      if (win && !win.isDestroyed()) {
        win.removeAllListeners("closed");
        passBreakWindow = null;
        passBreakContext = null;
        win.close();
      } else {
        passBreakWindow = null;
        passBreakContext = null;
      }
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.focus();
        mainWindow.webContents.send("pass-break-duration-chosen", payload);
      }
      return true;
    } catch {
      return false;
    }
  }
);
electron.ipcMain.handle("close_pass_break_window", async () => {
  try {
    const win = passBreakWindow;
    if (win && !win.isDestroyed()) {
      win.removeAllListeners("closed");
      passBreakWindow = null;
      passBreakContext = null;
      win.close();
    } else {
      passBreakWindow = null;
      passBreakContext = null;
    }
    notifyMainPassBreakResult({ action: "cancelled" });
    return true;
  } catch {
    return false;
  }
});
function notifyMainPassBreakResult(payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("pass-break-flow-done", payload);
  }
}
electron.ipcMain.handle("pass_break_flow_complete", async (_, payload) => {
  try {
    const win = passBreakWindow;
    if (win && !win.isDestroyed()) {
      win.removeAllListeners("closed");
      passBreakWindow = null;
      passBreakContext = null;
      win.close();
    } else {
      passBreakWindow = null;
      passBreakContext = null;
    }
    notifyMainPassBreakResult(payload);
    return true;
  } catch {
    return false;
  }
});
electron.ipcMain.handle("pass_break_flow_cancel", async () => {
  try {
    const win = passBreakWindow;
    if (win && !win.isDestroyed()) {
      win.removeAllListeners("closed");
      passBreakWindow = null;
      passBreakContext = null;
      win.close();
    } else {
      passBreakWindow = null;
      passBreakContext = null;
    }
    notifyMainPassBreakResult({ action: "cancelled" });
    return true;
  } catch {
    return false;
  }
});
electron.ipcMain.handle("show_notification", async (_, title, body) => {
  try {
    if (mainWindow && process.platform !== "darwin") {
      const { Notification } = await import("electron");
      if (Notification.isSupported()) {
        new Notification({ title, body }).show();
        return true;
      }
    }
    if (process.platform === "darwin") {
      const { Notification } = await import("electron");
      if (Notification.isSupported()) {
        new Notification({ title, body }).show();
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
});
