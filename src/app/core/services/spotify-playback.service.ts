import {
  SpotifyNowPlayingDto,
  SpotifyNowPlayingIpcPayload,
} from '@/core/models/spotify-playback.model';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SpotifyPlaybackService {
  isDesktopSpotifyAvailable(): boolean {
    return typeof window !== 'undefined' &&
      Boolean(
        window.desktopAPI?.spotifyGetStatus &&
          window.desktopAPI.spotifyGetNowPlaying &&
          window.desktopAPI.spotifyConnect
      );
  }

  async getStatus(): Promise<{
    connected: boolean;
    hasClientId: boolean;
  }> {
    if (!window.desktopAPI?.spotifyGetStatus) {
      return { connected: false, hasClientId: false };
    }
    const r = await window.desktopAPI.spotifyGetStatus();
    if (!r.ok) {
      return { connected: false, hasClientId: false };
    }
    return { connected: r.connected, hasClientId: r.hasClientId };
  }

  async connect(): Promise<{ ok: boolean; error?: string }> {
    if (!window.desktopAPI?.spotifyConnect) {
      return { ok: false, error: 'not_desktop' };
    }
    return window.desktopAPI.spotifyConnect();
  }

  async disconnect(): Promise<void> {
    await window.desktopAPI?.spotifyDisconnect?.();
  }

  async fetchNowPlaying(): Promise<SpotifyNowPlayingDto | null> {
    if (!window.desktopAPI?.spotifyGetNowPlaying) {
      return null;
    }
    const raw: SpotifyNowPlayingIpcPayload =
      await window.desktopAPI.spotifyGetNowPlaying();
    if (!raw.ok || !raw.connected || !raw.playing) {
      return null;
    }
    return raw.playing;
  }

  async openExternalUrl(url: string): Promise<boolean> {
    if (window.desktopAPI?.openExternalUrl) {
      return window.desktopAPI.openExternalUrl(url);
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  }

  onAuthResult(cb: (r: { ok: boolean; error?: string }) => void): (() => void) | undefined {
    return window.desktopAPI?.onSpotifyAuthResult?.(cb);
  }
}
