// import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'
// import { createStyleImportPlugin } from 'vite-plugin-style-import'

// export default defineConfig({
//   plugins: [
//     vue(),
//     createStyleImportPlugin({
//       libs: [{
//         libraryName: 'vant',
//         esModule: true,
//         resolveStyle: (name) => `vant/es/${name}/style`
//       }]
//     })
//   ],
//   css: {
//     preprocessorOptions: {
//       scss: {
//         additionalData: `@import "./src/styles/variables.scss";`
//       }
//     }
//   }
// })