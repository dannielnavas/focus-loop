/** Estado de reproducción normalizado para la UI (Spotify vía Electron). */
export interface SpotifyNowPlayingDto {
  readonly isPlaying: boolean;
  readonly name: string;
  readonly artists: string;
  readonly imageUrl: string | null;
  readonly externalUrl: string | null;
}

export type SpotifyNowPlayingIpcPayload =
  | {
      ok: true;
      connected: true;
      playing: SpotifyNowPlayingDto | null;
    }
  | { ok: true; connected: false; playing: null }
  | { ok: false; error: string };
