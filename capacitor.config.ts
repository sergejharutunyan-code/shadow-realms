import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shadowrealms.game',
  appName: 'Shadow Realms',
  // Next.js static export output directory.
  webDir: 'out',
  android: {
    // Allow http://localhost asset serving; keeps the game fully offline.
    allowMixedContent: false,
  },
};

export default config;
