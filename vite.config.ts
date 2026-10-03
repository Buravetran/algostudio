import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// base './' keeps asset URLs relative, so the build works on GitHub Pages
// project sites (user.github.io/repo/) without hardcoding the repo name.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node' },
})
