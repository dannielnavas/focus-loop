const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const isDev = process.env.NODE_ENV === "development";

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../src/assets/icon.png"),
    show: false,
    // Configure to show only native operating system controls
    titleBarStyle: "customButtonsOnHover", // Use native controls
    frame: true, // Keep native frame with system controls
    // Make the window resizable
    resizable: true, // Changed to true to allow dynamic resizing
    // Allow minimize and maximize
    minimizable: false,
    maximizable: false,
    // Additional configurations for a better experience
    transparent: true,
    hasShadow: true,
  });

  // Load the Angular application
  const startUrl = isDev
    ? "http://localhost:4200"
    : `file://${path.join(__dirname, "../dist/focus-loop/browser/index.html")}`;

  mainWindow.loadURL(startUrl);

  // Show the window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle when the window is closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initializing
app.whenReady().then(() => {
  createWindow();

  // On macOS, it is common to recreate a window when clicking on the dock icon
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Exit when all windows are closed
app.on("window-all-closed", () => {
  // On macOS, it is common for applications to remain active until explicitly closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Configure the application menu
function buildAppMenu() {
  const template = [
    {
      label: "FocusLoop",
      submenu: [
        {
          label: "Generate Daily",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send("menu:generateDaily");
            }
          },
        },
        {
          label: "Profile",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send("menu:profile");
            }
          },
        },
        { type: "separator" },
        {
          label: "Logout",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send("menu:logout");
            }
          },
        },
        { type: "separator" },
        process.platform === "darwin"
          ? { role: "close", label: "Close Window" }
          : { role: "quit", label: "Exit" },
      ],
    },
    // Standard edit menu

    // Standard window menu

    // Simple help menu
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  return menu;
}

const menu = buildAppMenu();

// Agregar listeners para IPC
ipcMain.handle("resize-window", (event, { width, height }) => {
  if (mainWindow) {
    mainWindow.setSize(width, height);
    // Center the window on the screen
    mainWindow.center();
    return true;
  }
  return false;
});

ipcMain.handle("reset-window-size", () => {
  if (mainWindow) {
    mainWindow.setSize(1200, 800);
    mainWindow.center();
    return true;
  }
  return false;
});

ipcMain.handle("make-window-floating", (event, { width, height }) => {
  if (mainWindow) {
    // Make the window always visible over other applications
    mainWindow.setAlwaysOnTop(true);
    // Resize the window with specific dimensions
    mainWindow.setSize(width, height, false); // false to not animate the change
    // Center the window
    mainWindow.center();
    // Force window redraw
    mainWindow.webContents.invalidate();
    return true;
  }
  return false;
});

ipcMain.handle("reset-window-floating", () => {
  if (mainWindow) {
    // Remove always visible property
    mainWindow.setAlwaysOnTop(false);
    // Restore original size
    mainWindow.setSize(1200, 800, false); // false to not animate the change
    mainWindow.center();
    // Force window redraw
    mainWindow.webContents.invalidate();
    return true;
  }
  return false;
});

ipcMain.handle("move-window", (event, { x, y }) => {
  if (mainWindow) {
    mainWindow.setPosition(x, y);
    return true;
  }
  return false;
});

ipcMain.handle("hide-titlebar", () => {
  if (mainWindow) {
    // macOS only: hide traffic-light buttons if API exists
    if (typeof mainWindow.setWindowButtonVisibility === "function") {
      mainWindow.setWindowButtonVisibility(false);
    } else {
      // Windows/Linux fallback: we can't hide titlebar at runtime without recreating the window.
      // As a best-effort, hide the app menu bar.
      mainWindow.setMenuBarVisibility(false);
    }
    return true;
  }
  return false;
});

ipcMain.handle("show-titlebar", () => {
  if (mainWindow) {
    if (typeof mainWindow.setWindowButtonVisibility === "function") {
      mainWindow.setWindowButtonVisibility(true); // macOS
    } else {
      // Restore the menu bar on Windows/Linux
      mainWindow.setMenuBarVisibility(true);
    }
    return true;
  }
  return false;
});

ipcMain.handle("hide-menu", () => {
  Menu.setApplicationMenu(null);
  return true;
});

ipcMain.handle("show-menu", () => {
  Menu.setApplicationMenu(menu || buildAppMenu());
  return true;
});
