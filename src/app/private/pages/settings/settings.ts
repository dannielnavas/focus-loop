import { SpotifyPlaybackService } from '@/core/services/spotify-playback.service';
import { Header } from '@/shared/components/header/header';
import { UiButtonComponent, UiCardComponent, UiContainerComponent } from '@/shared/components/ui';
import { Component, inject, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-settings',
  imports: [Header, UiCardComponent, UiContainerComponent, UiButtonComponent],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  private readonly spotify = inject(SpotifyPlaybackService);

  readonly isDesktop = signal(false);
  readonly spotifyConnected = signal(false);
  readonly spotifyHasClientId = signal(false);
  readonly spotifyBusy = signal(false);
  readonly spotifyMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.isDesktop.set(this.spotify.isDesktopSpotifyAvailable());
    void this.refreshSpotify();
  }

  private mapSpotifyError(code?: string): string {
    const m: Record<string, string> = {
      missing_client_id:
        'Falta SPOTIFY_CLIENT_ID. Copia .env.example a .env y añade el Client ID de tu app en Spotify for Developers.',
      auth_in_progress: 'Ya hay un inicio de sesión en curso.',
      timeout: 'Se agotó el tiempo. Vuelve a intentar conectar.',
      cancelled: 'Conexión cancelada.',
      token_exchange_failed: 'Spotify rechazó el intercambio de token. Revisa la Redirect URI en el dashboard.',
      invalid_callback: 'Respuesta de Spotify no válida.',
      invalid_token_response: 'Respuesta de token inesperada.',
      server_failed: 'No se pudo abrir el servidor local para OAuth (puertos 45251–45255).',
      not_desktop: 'Solo disponible en la app de escritorio.',
    };
    return m[code ?? ''] ?? `No se pudo conectar (${code ?? 'error'}).`;
  }

  async refreshSpotify(): Promise<void> {
    if (!this.spotify.isDesktopSpotifyAvailable()) return;
    const s = await this.spotify.getStatus();
    this.spotifyConnected.set(s.connected);
    this.spotifyHasClientId.set(s.hasClientId);
  }

  async connectSpotify(): Promise<void> {
    this.spotifyMessage.set(null);
    this.spotifyBusy.set(true);
    const r = await this.spotify.connect();
    this.spotifyBusy.set(false);
    if (r.ok) {
      this.spotifyMessage.set('Spotify conectado correctamente.');
      await this.refreshSpotify();
    } else {
      this.spotifyMessage.set(this.mapSpotifyError(r.error));
    }
  }

  async disconnectSpotify(): Promise<void> {
    this.spotifyBusy.set(true);
    await this.spotify.disconnect();
    this.spotifyBusy.set(false);
    this.spotifyMessage.set('Cuenta de Spotify desvinculada de esta app.');
    await this.refreshSpotify();
  }

  openYouTubeMusic(): void {
    void this.spotify.openExternalUrl('https://music.youtube.com');
  }

  openSpotifyWeb(): void {
    void this.spotify.openExternalUrl('https://open.spotify.com');
  }
}
