import { installTauriElectronApi } from './tauri-electron-api';

// Initialize desktop bridge as early as possible.
void installTauriElectronApi();
