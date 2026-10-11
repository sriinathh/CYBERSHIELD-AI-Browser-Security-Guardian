import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx, defineManifest } from '@crxjs/vite-plugin';

const manifest = defineManifest({
  manifest_version: 3,
  name: 'CyberShield',
  version: '1.0.0',
  description: 'AI Browser Security Guardian',
  action: {
    default_popup: 'index.html',
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.ts'],
    },
  ],
  permissions: ['activeTab', 'storage', 'alarms', 'notifications', 'tabs'],
  host_permissions: ['<all_urls>'],
});

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  server: {
    port: 3002,
    strictPort: true,
  }
});
