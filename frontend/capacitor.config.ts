import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.musicservice.app',
  appName: 'MusicService',
  webDir: 'dist',
  server: {
    // Разрешает работу по локальной сети HTTP и внешним доменам в мобильном приложении
    cleartext: true,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
