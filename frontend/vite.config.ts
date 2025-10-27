import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 根据需要添加别名
    },
  },
  optimizeDeps: {
    include: [
      "@zama-fhe/relayer-sdk/web"  // ⚠️ 必须使用 /web 子路径
    ],
  },
  build: {
    target: "es2020",
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})

