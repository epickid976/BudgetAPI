// Example Nuxt 3 Configuration for Budget UI
// Copy this to your Nuxt project as nuxt.config.ts

export default defineNuxtConfig({
  // Development tools
  devtools: { enabled: true },

  // Modules
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
  ],

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: true,
  },

  // Color mode configuration (dark mode support)
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },

  // Runtime configuration (environment variables)
  runtimeConfig: {
    // Private keys (server-side only)
    // apiSecret: process.env.API_SECRET,

    // Public keys (exposed to client)
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000/api',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3001',
    },
  },

  // App configuration
  app: {
    head: {
      title: 'Budget Manager',
      titleTemplate: '%s | Budget Manager',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 
          name: 'description', 
          content: 'Manage your personal finances with ease. Track expenses, create budgets, and gain insights into your spending.' 
        },
        { name: 'format-detection', content: 'telephone=no' },
        
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Budget Manager' },
        { property: 'og:description', content: 'Personal finance management made simple' },
        
        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        // Google Fonts (optional - or use local fonts)
        { 
          rel: 'stylesheet', 
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' 
        },
      ],
    },
  },

  // CSS configuration
  css: [
    '~/assets/css/main.css',
  ],

  // Auto-imports configuration
  imports: {
    dirs: [
      'composables/**',
      'stores',
    ],
  },

  // Build configuration
  build: {
    transpile: ['chart.js'],
  },

  // Vite configuration
  vite: {
    optimizeDeps: {
      include: ['chart.js'],
    },
  },

  // Route rules (optional - for better performance)
  routeRules: {
    // Static pages (generated at build time)
    '/': { prerender: true },
    '/login': { prerender: true },
    '/register': { prerender: true },
    
    // SPA pages (client-side only)
    '/dashboard': { ssr: false },
    '/accounts/**': { ssr: false },
    '/transactions/**': { ssr: false },
    '/budgets/**': { ssr: false },
    '/reports/**': { ssr: false },
    '/settings/**': { ssr: false },
  },

  // Experimental features
  experimental: {
    payloadExtraction: false,
    typedPages: true,
  },

  // Nitro configuration (server)
  nitro: {
    compressPublicAssets: true,
  },

  // Pinia configuration
  pinia: {
    autoImports: [
      'defineStore',
      'storeToRefs',
    ],
  },

  // Tailwind CSS configuration
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.ts',
    exposeConfig: false,
    viewer: true,
  },
})

