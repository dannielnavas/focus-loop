import { defineConfig, loadEnv } from 'electron-vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const spotifyClientId = env.SPOTIFY_CLIENT_ID ?? '';

  return {
  main: {
    define: {
      __SPOTIFY_CLIENT_ID__: JSON.stringify(spotifyClientId),
    },
    build: {
      outDir: 'out/main',
      rollupOptions: {
        input: { index: resolve(__dirname, 'electron/main.ts') },
        output: { entryFileNames: 'index.js' },
      },
    },
  },
  preload: {
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: { index: resolve(__dirname, 'electron/preload.ts') },
        output: { entryFileNames: 'index.js' },
      },
    },
  },
};
});
