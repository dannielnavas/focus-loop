import type { SpotifyNowPlayingIpcPayload } from './spotify-playback.model';

declare global {
  interface Window {
    desktopAPI?: {
      resizeWindow: (width: number, height: number) => Promise<boolean>;
      resetWindowSize: () => Promise<boolean>;
      makeWindowFloating: (width: number, height: number, x?: number, y?: number) => Promise<boolean>;
      resetWindowFloating: () => Promise<boolean>;
      moveWindow: (x: number, y: number) => Promise<boolean>;
      hideTitlebar: () => Promise<boolean>;
      showTitlebar: () => Promise<boolean>;
      showNotification: (title: string, body: string) => Promise<boolean>;
      hideNotification: () => Promise<boolean>;
      hideMenu: () => Promise<boolean>;
      showMenu: () => Promise<boolean>;
      updateMenuWithUserData?: (userContext?: unknown) => Promise<boolean>;
      onMenuGenerateDaily: (cb: () => void) => void;
      onMenuProfile: (cb: () => void) => void;
      onMenuLogout: (cb: () => void) => void;
      onMenuAbout: (cb: () => void) => void;
      openPassBreakWindow?: (ctx: { taskTitle: string }) => Promise<boolean>;
      getPassBreakContext?: () => Promise<{ taskTitle: string } | null>;
      closePassBreakWindow?: () => Promise<boolean>;
      passBreakFlowComplete?: (payload: {
        action: 'advance-queue';
      }) => Promise<boolean>;
      passBreakFlowCancel?: () => Promise<boolean>;
      passBreakDurationChosen?: (minutes: 5 | 10 | 15) => Promise<boolean>;
      onPassBreakDurationChosen?: (
        cb: (p: { minutes: 5 | 10 | 15 }) => void
      ) => () => void;
      onPassBreakFlowDone?: (
        cb: (p: { action: 'advance-queue' } | { action: 'cancelled' }) => void
      ) => () => void;
      spotifyConnect?: () => Promise<{ ok: boolean; error?: string }>;
      spotifyDisconnect?: () => Promise<{ ok: boolean; error?: string }>;
      spotifyGetStatus?: () => Promise<
        | { ok: true; connected: boolean; hasClientId: boolean }
        | { ok: false; error: string }
      >;
      spotifyGetNowPlaying?: () => Promise<SpotifyNowPlayingIpcPayload>;
      openExternalUrl?: (url: string) => Promise<boolean>;
      onSpotifyAuthResult?: (
        cb: (r: { ok: boolean; error?: string }) => void
      ) => () => void;
    };
  }
}

export {};
