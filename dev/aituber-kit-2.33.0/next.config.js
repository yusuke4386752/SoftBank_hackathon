/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    DB_USER: 'kokorobo_app_user',
    DB_PASSWORD: 'TestPassword123!',
    DB_SERVER: 'kokorobo.database.windows.net',
    DB_DATABASE: 'ココロボ',
  }, // ★★★ このカンマが重要です ★★★

  // ▼▼▼ 以下は、お客様の元の設定です ▼▼▼
  reactStrictMode: true,
  assetPrefix: process.env.BASE_PATH || '',
  basePath: process.env.BASE_PATH || '',
  trailingSlash: true,
  publicRuntimeConfig: {
    root: process.env.BASE_PATH || '',
  },
  optimizeFonts: false,
};

module.exports = nextConfig;