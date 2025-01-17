import { defineConfig } from 'vite';
//import { createHtmlPlugin } from 'vite-plugin-html';

// export default defineConfig({
//   build: {
//     assetsInlineLimit: 0,
//   },
//   plugins: [createHtmlPlugin()],
// });

export default defineConfig({
	plugins: [],
	server: { host: '0.0.0.0', port: 8000 },
	clearScreen: false,
})
