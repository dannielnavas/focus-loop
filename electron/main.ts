import { app, BrowserWindow, ipcMain, Menu, dialog, shell } from 'electron';
import * as path from 'path';
import {
  spotifyDisconnect,
  spotifyGetNowPlaying,
  spotifyGetStatus,
  spotifyInitPersistence,
  spotifyStartAuth,
} from './spotify';

const ADMIN_SUBSCRIPTION_PLAN_ID = '2';
const ROLE_ADMIN = 'admin';
const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 800;

let mainWindow: BrowserWindow | null = null;
let passBreakWindow: BrowserWindow | null = null;
let passBreakContext: { taskTitle: string } | null = null;
let userContext: { role?: string; subscriptionPlan?: { subscription_plan_id?: string | number } } | null = null;

type PassBreakFlowPayload = { action: 'advance-queue' } | { action: 'cancelled' };

const PASS_BREAK_ROUTE = '/private/timer-pass-break';

/** Navega a la ruta del diálogo cuando Angular ya registró el listener (`electron-navigate`). */
function schedulePassBreakNavigation(win: BrowserWindow): void {
  let attempts = 0;
  const maxAttempts = 200;

  const tryNavigate = (): void => {
    if (win.isDestroyed()) return;
    const path = PASS_BREAK_ROUTE;
    void win.webContents
      .executeJavaScript(
        `(() => {
          if (window.__FL_APP_READY__) {
            window.dispatchEvent(new CustomEvent('electron-navigate', { detail: '${path}' }));
            return 'done';
          }
          return 'wait';
        })()`
      )
      .then((result: unknown) => {
        if (result === 'done') return;
        attempts += 1;
        if (attempts < maxAttempts) {
          setTimeout(tryNavigate, 80);
        } else {
          void win.webContents
            .executeJavaScript(
              `window.dispatchEvent(new CustomEvent('electron-navigate', { detail: '${path}' }));`
            )
            .catch(() => {});
        }
      })
      .catch(() => {
        attempts += 1;
        if (attempts < maxAttempts) setTimeout(tryNavigate, 80);
      });
  };

  setTimeout(tryNavigate, 120);
}

function isAdminUser(user: typeof userContext): boolean {
  if (!user) return false;
  if (user.role === ROLE_ADMIN) return true;
  const planId = user.subscriptionPlan?.subscription_plan_id;
  const idStr = planId != null ? String(planId) : '';
  return idStr === ADMIN_SUBSCRIPTION_PLAN_ID;
}

function isRoleAdmin(user: typeof userContext): boolean {
  return user?.role === ROLE_ADMIN;
}

function buildApplicationMenu(): Menu {
  const isAdmin = isAdminUser(userContext);
  const isAdminRole = isRoleAdmin(userContext);
  const isLoggedIn = userContext != null;

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Focus Loop',
      submenu: [
        { label: 'About Focus Loop', click: () => showAboutDialog() },
        { type: 'separator' as const },
        { label: 'Generate Daily', click: () => mainWindow?.webContents.send('menu:generateDaily') },
        ...(isAdminRole ? [{ label: 'Profile', click: () => mainWindow?.webContents.send('menu:profile') }] : []),
        ...(isLoggedIn ? [{ type: 'separator' as const }, { label: 'Logout', click: () => mainWindow?.webContents.send('menu:logout') }] : []),
        { type: 'separator' as const },
        { label: 'Quit', role: 'quit' as const },
      ].filter(Boolean),
    },
  ];

  return Menu.buildFromTemplate(template);
}

function showAboutDialog(): void {
  const version = app.getVersion();
  dialog.showMessageBox(mainWindow!, {
    type: 'info',
    title: 'Focus Loop',
    message: 'Focus Loop',
    detail: `Versión ${version}\n\nDeveloped by Danniel Navas. Focus Loop is a task management and productivity application.`,
  }).catch(() => {});
}

function getAngularPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app.asar', 'dist', 'focus-loop', 'browser', 'index.html');
  }
  return path.join(__dirname, '../../../dist/focus-loop/browser/index.html');
}

function createWindow(): void {
  const preloadPath = path.join(__dirname, '../preload/index.js');
  const isDev = process.env.ELECTRON_RENDERER_URL != null;

  mainWindow = new BrowserWindow({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    title: 'Focus Loop',
    resizable: false,
    maximizable: false,
    fullscreen: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: !app.isPackaged,
    },
    show: false,
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL).catch(() => {});
  } else {
    mainWindow.loadFile(getAngularPath()).catch((err) => {
      console.error('Failed to load Angular app:', err);
    });
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    if (isDev) {
      mainWindow?.webContents.openDevTools({ mode: 'detach' });
    }
  });

  applyMenu();
}

function applyMenu(): void {
  if (!mainWindow) return;
  const menu = buildApplicationMenu();
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  spotifyInitPersistence();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers (same API as Tauri desktopAPI)
ipcMain.handle('resize_window', async (_, width: number, height: number) => {
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

ipcMain.handle('reset_window_size', async () => {
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

ipcMain.handle('make_window_floating', async (_, width: number, height: number, x?: number, y?: number) => {
  try {
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(true, 'floating');
      mainWindow.setResizable(false);
      mainWindow.setMinimumSize(width, height);
      mainWindow.setMaximumSize(width, height);
      mainWindow.setSize(width, height);
      if (x !== undefined && y !== undefined) {
        mainWindow.setPosition(x, y);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
});

ipcMain.handle('reset_window_floating', async () => {
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

ipcMain.handle('move_window', async (_, x: number, y: number) => {
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

ipcMain.handle('hide_titlebar', async () => {
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

ipcMain.handle('show_titlebar', async () => {
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

ipcMain.handle('hide_menu', async () => {
  try {
    if (mainWindow) mainWindow.setMenu(null);
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('show_menu', async () => {
  try {
    applyMenu();
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('set_user_context', async (_, user_context: typeof userContext) => {
  try {
    userContext = user_context ?? null;
    applyMenu();
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('open_pass_break_window', async (_, ctx: { taskTitle: string }) => {
  try {
    if (!mainWindow || mainWindow.isDestroyed()) return false;
    passBreakContext = ctx;

    if (passBreakWindow && !passBreakWindow.isDestroyed()) {
      passBreakWindow.focus();
      schedulePassBreakNavigation(passBreakWindow);
      return true;
    }

    const preloadPath = path.join(__dirname, '../preload/index.js');
    const isDev = process.env.ELECTRON_RENDERER_URL != null;

    passBreakWindow = new BrowserWindow({
      width: 520,
      height: 480,
      minWidth: 400,
      minHeight: 380,
      title: 'Pasar tarea — Focus Loop',
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
        webSecurity: !app.isPackaged,
      },
    });

    passBreakWindow.on('closed', () => {
      passBreakWindow = null;
      passBreakContext = null;
      notifyMainPassBreakResult({ action: 'cancelled' });
    });

    if (isDev && process.env.ELECTRON_RENDERER_URL) {
      const base = process.env.ELECTRON_RENDERER_URL.replace(/\/?$/, '/');
      // Cargar la raíz: la ruta profunda en una ventana nueva a veces no hidrata; navegamos cuando Angular marque listo.
      await passBreakWindow.loadURL(base);
      schedulePassBreakNavigation(passBreakWindow);
    } else {
      passBreakWindow.webContents.once('did-finish-load', () => {
        schedulePassBreakNavigation(passBreakWindow!);
      });
      await passBreakWindow.loadFile(getAngularPath());
    }

    passBreakWindow.once('ready-to-show', () => {
      passBreakWindow?.show();
    });

    return true;
  } catch (e) {
    console.error('open_pass_break_window', e);
    return false;
  }
});

ipcMain.handle('get_pass_break_context', async () => passBreakContext);

ipcMain.handle(
  'pass_break_duration_chosen',
  async (_, payload: { minutes: 5 | 10 | 15 }) => {
    try {
      const win = passBreakWindow;
      if (win && !win.isDestroyed()) {
        win.removeAllListeners('closed');
        passBreakWindow = null;
        passBreakContext = null;
        win.close();
      } else {
        passBreakWindow = null;
        passBreakContext = null;
      }
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.focus();
        mainWindow.webContents.send('pass-break-duration-chosen', payload);
      }
      return true;
    } catch {
      return false;
    }
  }
);

ipcMain.handle('close_pass_break_window', async () => {
  try {
    const win = passBreakWindow;
    if (win && !win.isDestroyed()) {
      win.removeAllListeners('closed');
      passBreakWindow = null;
      passBreakContext = null;
      win.close();
    } else {
      passBreakWindow = null;
      passBreakContext = null;
    }
    notifyMainPassBreakResult({ action: 'cancelled' });
    return true;
  } catch {
    return false;
  }
});

function notifyMainPassBreakResult(payload: PassBreakFlowPayload): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('pass-break-flow-done', payload);
  }
}

ipcMain.handle('pass_break_flow_complete', async (_, payload: PassBreakFlowPayload) => {
  try {
    const win = passBreakWindow;
    if (win && !win.isDestroyed()) {
      win.removeAllListeners('closed');
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

ipcMain.handle('pass_break_flow_cancel', async () => {
  try {
    const win = passBreakWindow;
    if (win && !win.isDestroyed()) {
      win.removeAllListeners('closed');
      passBreakWindow = null;
      passBreakContext = null;
      win.close();
    } else {
      passBreakWindow = null;
      passBreakContext = null;
    }
    notifyMainPassBreakResult({ action: 'cancelled' });
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('spotify_connect', async () => {
  const result = await spotifyStartAuth();
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('spotify-auth-result', result);
  }
  return result;
});

ipcMain.handle('spotify_disconnect', async () => spotifyDisconnect());

ipcMain.handle('spotify_status', async () => spotifyGetStatus());

ipcMain.handle('spotify_now_playing', async () => spotifyGetNowPlaying());

ipcMain.handle('open_external_url', async (_, rawUrl: string) => {
  try {
    if (typeof rawUrl !== 'string' || !rawUrl.startsWith('https://')) {
      return false;
    }
    const u = new URL(rawUrl);
    if (u.protocol !== 'https:') return false;
    const host = u.hostname.toLowerCase();
    if (host !== 'music.youtube.com' && host !== 'open.spotify.com') {
      return false;
    }
    await shell.openExternal(rawUrl);
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('show_notification', async (_, title: string, body: string) => {
  try {
    if (mainWindow && process.platform !== 'darwin') {
      const { Notification } = await import('electron');
      if (Notification.isSupported()) {
        new Notification({ title, body }).show();
        return true;
      }
    }
    if (process.platform === 'darwin') {
      const { Notification } = await import('electron');
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
