import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/**
 * Preloads the Latin font so it arrives with the scripts. Without it the first headings paint in a
 * fallback font and repaint when Inter loads, which delays Largest Contentful Paint. The file name
 * carries a build hash, so the tag is added after bundling. (The Urdu font loads only for Urdu text.)
 */
function preloadLatinFont(): Plugin {
  return {
    name: 'medcare:preload-latin-font',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const font = Object.keys(ctx.bundle ?? {}).find((file) => /inter-latin-wght-normal-[\w-]+\.woff2$/.test(file));
        return font
          ? [{ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${font}`, crossorigin: '' }, injectTo: 'head' }]
          : [];
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadLatinFont()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rolldownOptions: {
      output: {
        codeSplitting: {
          // One file for every icon instead of one tiny file each: far fewer requests per page.
          groups: [{ name: 'icons', test: /node_modules[\\/]lucide-react/ }],
        },
      },
    },
  },
  server: { port: 5173 },
  preview: { port: 4173 },
});
