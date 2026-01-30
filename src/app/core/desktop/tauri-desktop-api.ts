type UnlistenFn = () => void;

function isTauriRuntime(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  // Tauri v2: withGlobalTauri exposes __TAURI__; core injects __TAURI_INTERNALS__.
  return Boolean(w.__TAURI__ ?? w.__TAURI_INTERNALS__);
}

function readUserDataFromStorage(): any | null {
  try {
    const raw = localStorage.getItem('focus_loop_data');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.user_data) return null;

    // user_data is persisted as a JSON string via StorageService.setObject()
    if (typeof parsed.user_data === 'string') {
      return JSON.parse(parsed.user_data);
    }
    return parsed.user_data;
  } catch {
    return null;
  }
}

export async function installDesktopApi(): Promise<void> {
  if (!isTauriRuntime()) return;
  if (window.desktopAPI) return;

  const [{ invoke }, { listen }, notification] = await Promise.all([
    import('@tauri-apps/api/core'),
    import('@tauri-apps/api/event'),
    import('@tauri-apps/plugin-notification'),
  ]);

  const showNotification = async (title: string, body: string): Promise<boolean> => {
    try {
      let granted = await notification.isPermissionGranted();
      if (!granted) {
        const permission = await notification.requestPermission();
        granted = permission === 'granted';
      }
      if (!granted) return false;
      notification.sendNotification({ title, body });
      return true;
    } catch {
      return false;
    }
  };

  const updateMenuWithUserData = async (): Promise<boolean> => {
    try {
      const user = readUserDataFromStorage();
      await invoke('set_user_context', { user_context: user });
      return true;
    } catch {
      return false;
    }
  };

  const listeners: Record<string, UnlistenFn[]> = {};

  const addListener = async (eventName: string, cb: () => void) => {
    const unlisten = await listen(eventName, () => cb());
    listeners[eventName] = listeners[eventName] || [];
    listeners[eventName].push(unlisten);
  };

  window.desktopAPI = {
    resizeWindow: async (width: number, height: number) => {
      try {
        await invoke('resize_window', { width, height });
        return true;
      } catch {
        return false;
      }
    },
    resetWindowSize: async () => {
      try {
        await invoke('reset_window_size');
        return true;
      } catch {
        return false;
      }
    },
    makeWindowFloating: async (width: number, height: number) => {
      try {
        await invoke('make_window_floating', { width, height });
        return true;
      } catch {
        return false;
      }
    },
    resetWindowFloating: async () => {
      try {
        await invoke('reset_window_floating');
        return true;
      } catch {
        return false;
      }
    },
    moveWindow: async (x: number, y: number) => {
      try {
        await invoke('move_window', { x, y });
        return true;
      } catch {
        return false;
      }
    },
    hideTitlebar: async () => {
      try {
        await invoke('hide_titlebar');
        return true;
      } catch {
        return false;
      }
    },
    showTitlebar: async () => {
      try {
        await invoke('show_titlebar');
        return true;
      } catch {
        return false;
      }
    },
    showNotification,
    hideNotification: async () => true,
    hideMenu: async () => {
      try {
        await invoke('hide_menu');
        return true;
      } catch {
        return false;
      }
    },
    showMenu: async () => {
      try {
        await invoke('show_menu');
        return true;
      } catch {
        return false;
      }
    },
    updateMenuWithUserData,
    onMenuGenerateDaily: (cb: () => void) => {
      void addListener('menu:generateDaily', cb);
    },
    onMenuProfile: (cb: () => void) => {
      void addListener('menu:profile', cb);
    },
    onMenuLogout: (cb: () => void) => {
      void addListener('menu:logout', cb);
    },
    onMenuAbout: (cb: () => void) => {
      void addListener('menu:about', cb);
    },
  };

  void updateMenuWithUserData();
}
