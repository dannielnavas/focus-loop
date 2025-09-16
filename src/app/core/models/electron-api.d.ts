declare global {
  interface Window {
    electronAPI?: {
      resizeWindow: (width: number, height: number) => Promise<boolean>;
      resetWindowSize: () => Promise<boolean>;
      makeWindowFloating: (width: number, height: number) => Promise<boolean>;
      resetWindowFloating: () => Promise<boolean>;
      moveWindow: (x: number, y: number) => Promise<boolean>;
      hideTitlebar: () => Promise<boolean>;
      showTitlebar: () => Promise<boolean>;
      showNotification: (title: string, body: string) => Promise<boolean>;
      hideNotification: () => Promise<boolean>;
      hideMenu: () => Promise<boolean>;
      showMenu: () => Promise<boolean>;
      onMenuGenerateDaily: (cb: () => void) => void;
      onMenuProfile: (cb: () => void) => void;
      onMenuLogout: (cb: () => void) => void;
      onMenuAbout: (cb: () => void) => void;
    };
  }
}

export {};
