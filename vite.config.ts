import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    extensions: [".jsx", ".js", ".json", ".ts", ".tsx"],
    alias: {
      "@": resolve(__dirname, "src"),
      "~/": resolve(__dirname, "src/"),
    },
  },
  build: {
    target: "es2015",
    cssTarget: "chrome65",
    outDir: "dist",
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MinorDB',
      // the proper extensions will be added
      fileName: (format) => `tz-ui.${format}.js`,
    },
  },
})
