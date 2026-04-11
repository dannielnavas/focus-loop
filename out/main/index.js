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
const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
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
const crypto__namespace = /* @__PURE__ */ _interopNamespaceDefault(crypto);
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const http__namespace = /* @__PURE__ */ _interopNamespaceDefault(http);
const SPOTIFY_AUTH_BASE = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API = "https://api.spotify.com/v1";
const SPOTIFY_SCOPES = "user-read-currently-playing user-read-playback-state";
const OAUTH_HOST = "127.0.0.1";
const OAUTH_PATH = "/spotify-callback";
const OAUTH_PORTS = [45251, 45252, 45253, 45254, 45255];
function getClientId() {
  try {
    if ("60f39cc7c7344014a6d751144426ba9c".trim()) {
      return "60f39cc7c7344014a6d751144426ba9c".trim();
    }
  } catch {
  }
  return (process.env.SPOTIFY_CLIENT_ID ?? "").trim();
}
function tokenFilePath() {
  return path__namespace.join(electron.app.getPath("userData"), "spotify-refresh.enc");
}
let accessTokenMem = null;
let accessExpiresAt = 0;
let refreshTokenMem = null;
function loadRefreshFromDisk() {
  try {
    const p = tokenFilePath();
    if (!fs__namespace.existsSync(p)) return;
    const buf = fs__namespace.readFileSync(p);
    if (electron.safeStorage.isEncryptionAvailable()) {
      refreshTokenMem = electron.safeStorage.decryptString(buf);
    } else {
      refreshTokenMem = buf.toString("utf8");
      console.warn("[spotify] safeStorage no disponible; token en texto plano (solo desarrollo).");
    }
  } catch (e) {
    console.error("[spotify] no se pudo leer el token guardado", e);
  }
}
function saveRefreshToDisk(token) {
  const p = tokenFilePath();
  if (!token) {
    try {
      if (fs__namespace.existsSync(p)) fs__namespace.unlinkSync(p);
    } catch {
    }
    return;
  }
  try {
    const data = electron.safeStorage.isEncryptionAvailable() ? electron.safeStorage.encryptString(token) : Buffer.from(token, "utf8");
    fs__namespace.writeFileSync(p, data);
  } catch (e) {
    console.error("[spotify] no se pudo guardar el token", e);
  }
}
function base64url(buf) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function randomVerifier() {
  return base64url(crypto__namespace.randomBytes(32));
}
function challengeFromVerifier(verifier) {
  const hash = crypto__namespace.createHash("sha256").update(verifier).digest();
  return base64url(hash);
}
function randomState() {
  return base64url(crypto__namespace.randomBytes(16));
}
async function postForm(url, body) {
  const form = new URLSearchParams(body);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString()
  });
  const text = await res.text();
  if (!res.ok) {
    return { ok: false, status: res.status, text };
  }
  try {
    return { ok: true, json: JSON.parse(text) };
  } catch {
    return { ok: false, status: res.status, text };
  }
}
function applyTokenPayload(data) {
  accessTokenMem = data.access_token;
  accessExpiresAt = Date.now() + Math.max(0, (data.expires_in ?? 3600) - 60) * 1e3;
  if (data.refresh_token) {
    refreshTokenMem = data.refresh_token;
    saveRefreshToDisk(refreshTokenMem);
  }
}
async function refreshAccessToken() {
  const clientId = getClientId();
  if (!clientId || !refreshTokenMem) return false;
  const res = await postForm(SPOTIFY_TOKEN_URL, {
    grant_type: "refresh_token",
    refresh_token: refreshTokenMem,
    client_id: clientId
  });
  if (!res.ok) {
    console.error("[spotify] refresh falló", res.status, res.text);
    if (res.status === 400 || res.status === 401) {
      refreshTokenMem = null;
      saveRefreshToDisk(null);
      accessTokenMem = null;
    }
    return false;
  }
  const j = res.json;
  if (!j.access_token) return false;
  applyTokenPayload(j);
  return true;
}
async function ensureAccessToken() {
  const clientId = getClientId();
  if (!clientId) return null;
  if (!refreshTokenMem) loadRefreshFromDisk();
  if (!refreshTokenMem) return null;
  if (accessTokenMem && Date.now() < accessExpiresAt) {
    return accessTokenMem;
  }
  const ok = await refreshAccessToken();
  return ok ? accessTokenMem : null;
}
let pending = null;
function clearPending(result) {
  if (!pending) return;
  clearTimeout(pending.timeoutId);
  try {
    pending.server.close();
  } catch {
  }
  pending.resolve(result);
  pending = null;
}
function tryListenPort(port) {
  return new Promise((resolve, reject) => {
    const server = http__namespace.createServer();
    server.once("error", reject);
    server.listen(port, OAUTH_HOST, () => {
      server.removeAllListeners("error");
      resolve(server);
    });
  });
}
async function startOAuthListener(onHit) {
  let lastErr;
  for (const port of OAUTH_PORTS) {
    try {
      const server = await tryListenPort(port);
      const redirectUri = `http://${OAUTH_HOST}:${port}${OAUTH_PATH}`;
      server.on("request", (req, res) => {
        const url = new URL(req.url ?? "/", `http://${OAUTH_HOST}:${port}`);
        if (url.pathname !== OAUTH_PATH) {
          res.writeHead(404);
          res.end();
          return;
        }
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(
          '<!DOCTYPE html><html><body style="font-family:system-ui;padding:1.5rem"><p>Autorización recibida. Puedes cerrar esta ventana y volver a Focus Loop.</p></body></html>'
        );
        onHit(code ?? "", state ?? "", error);
      });
      return { server, redirectUri };
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(
    `No se pudo abrir un puerto local para Spotify (${OAUTH_PORTS.join(", ")}): ${String(lastErr)}`
  );
}
async function spotifyStartAuth() {
  const clientId = getClientId();
  if (!clientId) {
    return { ok: false, error: "missing_client_id" };
  }
  if (pending) {
    return { ok: false, error: "auth_in_progress" };
  }
  return new Promise((resolve) => {
    const verifier = randomVerifier();
    const state = randomState();
    const challenge = challengeFromVerifier(verifier);
    void startOAuthListener((code, st, oauthError) => {
      if (!pending) return;
      if (oauthError) {
        clearPending({ ok: false, error: oauthError });
        return;
      }
      if (!code || st !== pending.state) {
        clearPending({ ok: false, error: "invalid_callback" });
        return;
      }
      void (async () => {
        const p = pending;
        if (!p) return;
        const exchange = await postForm(SPOTIFY_TOKEN_URL, {
          grant_type: "authorization_code",
          code,
          redirect_uri: p.redirectUri,
          client_id: clientId,
          code_verifier: p.verifier
        });
        if (!exchange.ok) {
          console.error("[spotify] intercambio de código falló", exchange.status, exchange.text);
          clearPending({ ok: false, error: "token_exchange_failed" });
          return;
        }
        const j = exchange.json;
        if (!j.access_token) {
          clearPending({ ok: false, error: "invalid_token_response" });
          return;
        }
        if (j.refresh_token) {
          applyTokenPayload(j);
        } else {
          if (!refreshTokenMem) loadRefreshFromDisk();
          if (!refreshTokenMem) {
            clearPending({ ok: false, error: "invalid_token_response" });
            return;
          }
          accessTokenMem = j.access_token;
          accessExpiresAt = Date.now() + Math.max(0, (j.expires_in ?? 3600) - 60) * 1e3;
        }
        clearPending({ ok: true });
      })();
    }).then(({ server, redirectUri }) => {
      const timeoutId = setTimeout(() => {
        clearPending({ ok: false, error: "timeout" });
      }, 6e5);
      pending = {
        state,
        verifier,
        redirectUri,
        resolve,
        timeoutId,
        server
      };
      const params = new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        redirect_uri: redirectUri,
        scope: SPOTIFY_SCOPES,
        code_challenge_method: "S256",
        code_challenge: challenge,
        state
      });
      const authUrl = `${SPOTIFY_AUTH_BASE}?${params.toString()}`;
      void electron.shell.openExternal(authUrl);
    }).catch((err) => {
      console.error("[spotify] startAuth", err);
      resolve({ ok: false, error: "server_failed" });
    });
  });
}
function spotifyDisconnect() {
  refreshTokenMem = null;
  accessTokenMem = null;
  accessExpiresAt = 0;
  saveRefreshToDisk(null);
  if (pending) {
    clearPending({ ok: false, error: "cancelled" });
  }
  return { ok: true };
}
function spotifyGetStatus() {
  try {
    if (!refreshTokenMem) loadRefreshFromDisk();
    const hasClientId = Boolean(getClientId());
    const connected = Boolean(refreshTokenMem);
    return { ok: true, connected, hasClientId };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
async function spotifyGetNowPlaying() {
  const status = spotifyGetStatus();
  if (!status.ok) return { ok: false, error: "status_failed" };
  if (!status.connected) {
    return { ok: true, connected: false, playing: null };
  }
  const token = await ensureAccessToken();
  if (!token) {
    return { ok: true, connected: false, playing: null };
  }
  const res = await fetch(`${SPOTIFY_API}/me/player/currently-playing`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.status === 204) {
    return {
      ok: true,
      connected: true,
      playing: null
    };
  }
  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed && accessTokenMem) {
      return spotifyGetNowPlaying();
    }
    return { ok: true, connected: false, playing: null };
  }
  if (!res.ok) {
    if (res.status === 429) {
      return { ok: false, error: "rate_limited" };
    }
    return { ok: false, error: `http_${res.status}` };
  }
  const data = await res.json();
  const item = data.item;
  if (!item) {
    return { ok: true, connected: true, playing: null };
  }
  const artists = (item.artists ?? []).map((a) => a.name ?? "").filter(Boolean).join(", ");
  const images = item.album?.images ?? [];
  const imageUrl = images.length ? images[0]?.url ?? null : null;
  return {
    ok: true,
    connected: true,
    playing: {
      isPlaying: Boolean(data.is_playing),
      name: item.name ?? "—",
      artists: artists || "—",
      imageUrl,
      externalUrl: item.external_urls?.spotify ?? null
    }
  };
}
function spotifyInitPersistence() {
  loadRefreshFromDisk();
}
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
  spotifyInitPersistence();
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
electron.ipcMain.handle("spotify_connect", async () => {
  const result = await spotifyStartAuth();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("spotify-auth-result", result);
  }
  return result;
});
electron.ipcMain.handle("spotify_disconnect", async () => spotifyDisconnect());
electron.ipcMain.handle("spotify_status", async () => {
  const s = spotifyGetStatus();
  if (s.ok) {
    return { ...s, isPackaged: electron.app.isPackaged };
  }
  return s;
});
electron.ipcMain.handle("spotify_now_playing", async () => spotifyGetNowPlaying());
electron.ipcMain.handle("open_external_url", async (_, rawUrl) => {
  try {
    if (typeof rawUrl !== "string" || !rawUrl.startsWith("https://")) {
      return false;
    }
    const u = new URL(rawUrl);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    if (host !== "music.youtube.com" && host !== "open.spotify.com") {
      return false;
    }
    await electron.shell.openExternal(rawUrl);
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
