const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const isDev = process.env.NODE_ENV === "development";
const adminSubscriptionPlanId = "2";
const roleAdmin = "admin";

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
    resizable: true,
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

  // Escuchar cuando la página esté completamente cargada
  mainWindow.webContents.once("did-finish-load", () => {
    console.log("Página completamente cargada");

    // Actualizar el menú con los datos del usuario después de que la página esté cargada
    // Usar un enfoque más robusto con múltiples intentos
    const attemptMenuUpdate = async (attempt = 1, maxAttempts = 5) => {
      try {
        console.log(`Intento ${attempt} de actualización del menú...`);

        // Ejecutar script con manejo de errores más detallado
        const userData = await mainWindow.webContents.executeJavaScript(`
          (function() {
            try {
              // Verificar que el contexto esté listo
              if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
                return { error: 'Context not ready', attempt: ${attempt} };
              }

              const focusLoopData = localStorage.getItem('focus_loop_data');
              if (!focusLoopData || focusLoopData === 'null' || focusLoopData === 'undefined') {
                return { error: 'No data found', attempt: ${attempt} };
              }

              const parsedData = JSON.parse(focusLoopData);
              if (!parsedData || typeof parsedData !== 'object' || !parsedData.user_data) {
                return { error: 'Invalid data structure', attempt: ${attempt} };
              }

              // Asegurar que user_data sea un objeto, no una cadena
              let userDataObj = parsedData.user_data;
              if (typeof userDataObj === 'string') {
                userDataObj = JSON.parse(userDataObj);
              }

              return { success: true, data: userDataObj, attempt: ${attempt} };
            } catch (e) {
              return { error: e.message, attempt: ${attempt} };
            }
          })();
        `);

        console.log(`Resultado del intento ${attempt}:`, userData);

        if (userData && userData.success && userData.data) {
          console.log("Datos del usuario parseados:", userData.data);
          console.log("Tipo de datos:", typeof userData.data);
          console.log("subscriptionPlan:", userData.data.subscriptionPlan);
          updateMenu(userData.data);
          console.log("Menú actualizado exitosamente con datos del usuario");
        } else if (userData && userData.error) {
          console.log(`Error en intento ${attempt}:`, userData.error);
          if (attempt < maxAttempts) {
            setTimeout(() => attemptMenuUpdate(attempt + 1, maxAttempts), 2000);
          } else {
            console.log(
              "Máximo de intentos alcanzado, usando menú por defecto"
            );
            updateMenu(null);
          }
        } else {
          updateMenu(null);
        }
      } catch (error) {
        console.error(
          `Error en intento ${attempt} de actualización del menú:`,
          error
        );
        if (attempt < maxAttempts) {
          setTimeout(() => attemptMenuUpdate(attempt + 1, maxAttempts), 2000);
        } else {
          console.log(
            "Máximo de intentos alcanzado debido a errores, usando menú por defecto"
          );
          updateMenu(null);
        }
      }
    };

    // Iniciar el primer intento después de un breve delay para que Angular se inicialice
    setTimeout(() => attemptMenuUpdate(), 3000);
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
function buildAppMenu(userData = null) {
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
          visible:
            (userData && userData.role === roleAdmin) ||
            (userData &&
              userData.subscriptionPlan &&
              userData.subscriptionPlan.subscription_plan_id ===
                adminSubscriptionPlanId),
        },
        {
          label: "Profile",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send("menu:profile");
            }
          },
          visible: userData && userData.role === roleAdmin,
        },
        // {
        //   label: "DevTools",
        //   click: () => {
        //     if (mainWindow) {
        //       mainWindow.webContents.openDevTools();
        //     }
        //   },
        //   visible: userData && userData.role === roleAdmin,
        // },
        { type: "separator" },
        {
          label: "Logout",
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send("menu:logout");
            }
          },
          visible: userData,
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

// Variable para almacenar el menú actual
let currentMenu = null;

// Función para actualizar el menú con datos del usuario
function updateMenu(userData) {
  currentMenu = buildAppMenu(userData);
  Menu.setApplicationMenu(currentMenu);
}

// Inicializar menú sin datos de usuario
updateMenu(null);

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
  Menu.setApplicationMenu(currentMenu || buildAppMenu());
  return true;
});

// Handler para obtener datos del usuario desde el renderizado
ipcMain.handle("get-user-data", async () => {
  if (mainWindow) {
    try {
      // Solicitar datos del usuario al renderizado con manejo robusto de errores
      const result = await mainWindow.webContents.executeJavaScript(`
        (function() {
          try {
            if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
              return { error: 'Context not ready' };
            }

            const focusLoopData = localStorage.getItem('focus_loop_data');
            if (!focusLoopData || focusLoopData === 'null' || focusLoopData === 'undefined') {
              return { error: 'No data found' };
            }

            const parsedData = JSON.parse(focusLoopData);
            if (!parsedData || typeof parsedData !== 'object' || !parsedData.user_data) {
              return { error: 'Invalid data structure' };
            }

            // Asegurar que user_data sea un objeto, no una cadena
            let userDataObj = parsedData.user_data;
            if (typeof userDataObj === 'string') {
              userDataObj = JSON.parse(userDataObj);
            }

            return { success: true, data: userDataObj };
          } catch (e) {
            return { error: e.message };
          }
        })();
      `);

      if (result && result.success && result.data) {
        return result.data;
      } else {
        console.log(
          "No se pudieron obtener datos del usuario:",
          result?.error || "Resultado inesperado"
        );
        return null;
      }
    } catch (error) {
      console.error("Error obteniendo datos del usuario:", error);
      return null;
    }
  }
  return null;
});

// Handler para actualizar el menú con datos del usuario
ipcMain.handle("update-menu-with-user-data", async () => {
  if (mainWindow) {
    try {
      const result = await mainWindow.webContents.executeJavaScript(`
        (function() {
          try {
            if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
              return { error: 'Context not ready' };
            }

            const focusLoopData = localStorage.getItem('focus_loop_data');
            if (!focusLoopData || focusLoopData === 'null' || focusLoopData === 'undefined') {
              return { error: 'No data found' };
            }

            const parsedData = JSON.parse(focusLoopData);
            if (!parsedData || typeof parsedData !== 'object' || !parsedData.user_data) {
              return { error: 'Invalid data structure' };
            }

            // Asegurar que user_data sea un objeto, no una cadena
            let userDataObj = parsedData.user_data;
            if (typeof userDataObj === 'string') {
              userDataObj = JSON.parse(userDataObj);
            }

            return { success: true, data: userDataObj };
          } catch (e) {
            return { error: e.message };
          }
        })();
      `);

      if (result && result.success && result.data) {
        updateMenu(result.data);
        console.log("Menú actualizado exitosamente via IPC");
      } else {
        console.log(
          "No se pudieron obtener datos del usuario para actualizar menú:",
          result?.error || "Resultado inesperado"
        );
        updateMenu(null);
      }
      return true;
    } catch (error) {
      console.error("Error actualizando menú:", error);
      // Continuar con menú por defecto si hay error
      updateMenu(null);
      return false;
    }
  }
  return false;
});
