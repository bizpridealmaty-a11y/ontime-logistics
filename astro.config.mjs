import { defineConfig } from 'astro/config';
export default defineConfig({
  output: 'static',
  site: 'https://ontimeservice.kz',
  trailingSlash: 'always',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
    format: 'directory',
  },
});
