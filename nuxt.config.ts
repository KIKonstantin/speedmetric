// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    mongoUri: process.env.MONGODB_URI || '',
    pagespeedApiKey: process.env.PAGESPEED_API_KEY || ''
  },
  app: {
    buildAssetsDir: 'assets',
    baseURL: '/speedmetric/',
  }
})
