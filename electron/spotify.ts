/**
 * Spotify OAuth (PKCE) + almacenamiento del refresh token + lectura de "now playing".
 * El usuario añade en Spotify Dashboard: Redirect URI http://127.0.0.1:45251/spotify-callback
 */
import { app, safeStorage, shell } from 'electron';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';

declare const __SPOTIFY_CLIENT_ID__: string;

const SPOTIFY_AUTH_BASE = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API = 'https://api.spotify.com/v1';
const SPOTIFY_SCOPES = 'user-read-currently-playing user-read-playback-state';
const OAUTH_HOST = '127.0.0.1';
const OAUTH_PATH = '/spotify-callback';
const OAUTH_PORTS = [45251, 45252, 45253, 45254, 45255];

export type SpotifyAuthResult = { ok: true } | { ok: false; error: string };

export type SpotifyNowPlayingPayload =
  | {
      ok: true;
      connected: true;
      playing: {
        isPlaying: boolean;
        name: string;
        artists: string;
        imageUrl: string | null;
        externalUrl: string | null;
      } | null;
    }
  | { ok: true; connected: false; playing: null }
  | { ok: false; error: string };

export type SpotifyStatusPayload =
  | { ok: true; connected: boolean; hasClientId: boolean }
  | { ok: false; error: string };

function getClientId(): string {
  try {
    if (typeof __SPOTIFY_CLIENT_ID__ === 'string' && __SPOTIFY_CLIENT_ID__.trim()) {
      return __SPOTIFY_CLIENT_ID__.trim();
    }
  } catch {
    /* define ausente en tests */
  }
  return (process.env.SPOTIFY_CLIENT_ID ?? '').trim();
}

function tokenFilePath(): string {
  return path.join(app.getPath('userData'), 'spotify-refresh.enc');
}

let accessTokenMem: string | null = null;
let accessExpiresAt = 0;
let refreshTokenMem: string | null = null;

function loadRefreshFromDisk(): void {
  try {
    const p = tokenFilePath();
    if (!fs.existsSync(p)) return;
    const buf = fs.readFileSync(p);
    if (safeStorage.isEncryptionAvailable()) {
      refreshTokenMem = safeStorage.decryptString(buf);
    } else {
      refreshTokenMem = buf.toString('utf8');
      console.warn('[spotify] safeStorage no disponible; token en texto plano (solo desarrollo).');
    }
  } catch (e) {
    console.error('[spotify] no se pudo leer el token guardado', e);
  }
}

function saveRefreshToDisk(token: string | null): void {
  const p = tokenFilePath();
  if (!token) {
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch {
      /* ignore */
    }
    return;
  }
  try {
    const data = safeStorage.isEncryptionAvailable()
      ? safeStorage.encryptString(token)
      : Buffer.from(token, 'utf8');
    fs.writeFileSync(p, data);
  } catch (e) {
    console.error('[spotify] no se pudo guardar el token', e);
  }
}

function base64url(buf: Buffer): string {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function randomVerifier(): string {
  return base64url(crypto.randomBytes(32));
}

function challengeFromVerifier(verifier: string): string {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64url(hash);
}

function randomState(): string {
  return base64url(crypto.randomBytes(16));
}

async function postForm(
  url: string,
  body: Record<string, string>
): Promise<{ ok: true; json: unknown } | { ok: false; status: number; text: string }> {
  const form = new URLSearchParams(body);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString(),
  });
  const text = await res.text();
  if (!res.ok) {
    return { ok: false, status: res.status, text };
  }
  try {
    return { ok: true, json: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, status: res.status, text };
  }
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
};

function applyTokenPayload(data: TokenResponse): void {
  accessTokenMem = data.access_token;
  accessExpiresAt = Date.now() + Math.max(0, (data.expires_in ?? 3600) - 60) * 1000;
  if (data.refresh_token) {
    refreshTokenMem = data.refresh_token;
    saveRefreshToDisk(refreshTokenMem);
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const clientId = getClientId();
  if (!clientId || !refreshTokenMem) return false;
  const res = await postForm(SPOTIFY_TOKEN_URL, {
    grant_type: 'refresh_token',
    refresh_token: refreshTokenMem,
    client_id: clientId,
  });
  if (!res.ok) {
    console.error('[spotify] refresh falló', res.status, res.text);
    if (res.status === 400 || res.status === 401) {
      refreshTokenMem = null;
      saveRefreshToDisk(null);
      accessTokenMem = null;
    }
    return false;
  }
  const j = res.json as TokenResponse;
  if (!j.access_token) return false;
  applyTokenPayload(j);
  return true;
}

async function ensureAccessToken(): Promise<string | null> {
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

type PendingAuth = {
  state: string;
  verifier: string;
  redirectUri: string;
  resolve: (r: SpotifyAuthResult) => void;
  timeoutId: ReturnType<typeof setTimeout>;
  server: http.Server;
};

let pending: PendingAuth | null = null;

function clearPending(result: SpotifyAuthResult): void {
  if (!pending) return;
  clearTimeout(pending.timeoutId);
  try {
    pending.server.close();
  } catch {
    /* ignore */
  }
  pending.resolve(result);
  pending = null;
}

function tryListenPort(port: number): Promise<http.Server> {
  return new Promise((resolve, reject) => {
    const server = http.createServer();
    server.once('error', reject);
    server.listen(port, OAUTH_HOST, () => {
      server.removeAllListeners('error');
      resolve(server);
    });
  });
}

async function startOAuthListener(
  onHit: (code: string, state: string, error: string | null) => void
): Promise<{ server: http.Server; redirectUri: string }> {
  let lastErr: unknown;
  for (const port of OAUTH_PORTS) {
    try {
      const server = await tryListenPort(port);
      const redirectUri = `http://${OAUTH_HOST}:${port}${OAUTH_PATH}`;

      server.on('request', (req, res) => {
        const url = new URL(req.url ?? '/', `http://${OAUTH_HOST}:${port}`);
        if (url.pathname !== OAUTH_PATH) {
          res.writeHead(404);
          res.end();
          return;
        }
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(
          '<!DOCTYPE html><html><body style="font-family:system-ui;padding:1.5rem">' +
            '<p>Autorización recibida. Puedes cerrar esta ventana y volver a Focus Loop.</p>' +
            '</body></html>'
        );
        onHit(code ?? '', state ?? '', error);
      });

      return { server, redirectUri };
    } catch (e) {
      lastErr = e;
    }
  }
  throw new Error(
    `No se pudo abrir un puerto local para Spotify (${OAUTH_PORTS.join(', ')}): ${String(lastErr)}`
  );
}

export async function spotifyStartAuth(): Promise<SpotifyAuthResult> {
  const clientId = getClientId();
  if (!clientId) {
    return { ok: false, error: 'missing_client_id' };
  }
  if (pending) {
    return { ok: false, error: 'auth_in_progress' };
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
        clearPending({ ok: false, error: 'invalid_callback' });
        return;
      }

      void (async () => {
        const p = pending;
        if (!p) return;
        const exchange = await postForm(SPOTIFY_TOKEN_URL, {
          grant_type: 'authorization_code',
          code,
          redirect_uri: p.redirectUri,
          client_id: clientId,
          code_verifier: p.verifier,
        });
        if (!exchange.ok) {
          console.error('[spotify] intercambio de código falló', exchange.status, exchange.text);
          clearPending({ ok: false, error: 'token_exchange_failed' });
          return;
        }
        const j = exchange.json as TokenResponse;
        if (!j.access_token) {
          clearPending({ ok: false, error: 'invalid_token_response' });
          return;
        }
        // Spotify solo devuelve refresh_token en la primera concesión; en re-autorizaciones suele omitirlo.
        if (j.refresh_token) {
          applyTokenPayload(j);
        } else {
          if (!refreshTokenMem) loadRefreshFromDisk();
          if (!refreshTokenMem) {
            clearPending({ ok: false, error: 'invalid_token_response' });
            return;
          }
          accessTokenMem = j.access_token;
          accessExpiresAt =
            Date.now() + Math.max(0, (j.expires_in ?? 3600) - 60) * 1000;
        }
        clearPending({ ok: true });
      })();
    })
      .then(({ server, redirectUri }) => {
        const timeoutId = setTimeout(() => {
          clearPending({ ok: false, error: 'timeout' });
        }, 600_000);

        pending = {
          state,
          verifier,
          redirectUri,
          resolve,
          timeoutId,
          server,
        };

        const params = new URLSearchParams({
          client_id: clientId,
          response_type: 'code',
          redirect_uri: redirectUri,
          scope: SPOTIFY_SCOPES,
          code_challenge_method: 'S256',
          code_challenge: challenge,
          state,
        });
        const authUrl = `${SPOTIFY_AUTH_BASE}?${params.toString()}`;
        void shell.openExternal(authUrl);
      })
      .catch((err) => {
        console.error('[spotify] startAuth', err);
        resolve({ ok: false, error: 'server_failed' });
      });
  });
}

export function spotifyDisconnect(): SpotifyAuthResult {
  refreshTokenMem = null;
  accessTokenMem = null;
  accessExpiresAt = 0;
  saveRefreshToDisk(null);
  if (pending) {
    clearPending({ ok: false, error: 'cancelled' });
  }
  return { ok: true };
}

export function spotifyGetStatus(): SpotifyStatusPayload {
  try {
    if (!refreshTokenMem) loadRefreshFromDisk();
    const hasClientId = Boolean(getClientId());
    const connected = Boolean(refreshTokenMem);
    return { ok: true, connected, hasClientId };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function spotifyGetNowPlaying(): Promise<SpotifyNowPlayingPayload> {
  const status = spotifyGetStatus();
  if (!status.ok) return { ok: false, error: 'status_failed' };
  if (!status.connected) {
    return { ok: true, connected: false, playing: null };
  }
  const token = await ensureAccessToken();
  if (!token) {
    return { ok: true, connected: false, playing: null };
  }

  const res = await fetch(`${SPOTIFY_API}/me/player/currently-playing`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 204) {
    return {
      ok: true,
      connected: true,
      playing: null,
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
      return { ok: false, error: 'rate_limited' };
    }
    return { ok: false, error: `http_${res.status}` };
  }

  type SpotifyTrackItem = {
    is_playing?: boolean;
    item?: {
      name?: string;
      external_urls?: { spotify?: string };
      artists?: { name?: string }[];
      album?: { images?: { url?: string }[] };
    };
  };

  const data = (await res.json()) as SpotifyTrackItem;
  const item = data.item;
  if (!item) {
    return { ok: true, connected: true, playing: null };
  }
  const artists = (item.artists ?? []).map((a) => a.name ?? '').filter(Boolean).join(', ');
  const images = item.album?.images ?? [];
  const imageUrl = images.length ? (images[0]?.url ?? null) : null;
  return {
    ok: true,
    connected: true,
    playing: {
      isPlaying: Boolean(data.is_playing),
      name: item.name ?? '—',
      artists: artists || '—',
      imageUrl,
      externalUrl: item.external_urls?.spotify ?? null,
    },
  };
}

/** Llamar tras app.ready para cargar token en memoria. */
export function spotifyInitPersistence(): void {
  loadRefreshFromDisk();
}
