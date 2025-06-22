/** @type {import('next').NextConfig} */
const nextConfig = {
  // ★★★ CORS設定をここに追加します ★★★
  async headers() {
    return [
      {
        // matching all API routes
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ]
  },

  env: {
    // 既存のDB設定
    // データベース接続情報（kokorobo_app_userで接続します）
    DB_USER: 'kokorobo_app_user',
    DB_PASSWORD: 'TestPassword123!', // アプリ専用ユーザーのパスワード（テスト用）
    DB_SERVER: 'kokorobo.database.windows.net',
    DB_DATABASE: 'ココロボ',

    // 3種類のAI用のAPIキー
    DIFY_DEBATE_KEY: 'app-GWN7riKaQNPwqaxlOKsaWFxC',
    DIFY_OTSU_KEY: 'app-xDJ34xcv6PQVIDedog3ytfVI',
    DIFY_EXAMPLE_KEY: 'app-LMcomkYY637MHVdfCEiHnp7g',
  },

  // ▼▼▼ 以下は、お客様の元の設定です ▼▼▼
  reactStrictMode: true,
  assetPrefix: process.env.BASE_PATH || '',
  basePath: process.env.BASE_PATH || '',
  trailingSlash: true,
  publicRuntimeConfig: {
    root: process.env.BASE_PATH || '',
  },
  optimizeFonts: false,
}

module.exports = nextConfig
