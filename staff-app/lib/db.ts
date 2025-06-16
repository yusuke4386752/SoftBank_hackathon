/*
 * ファイルの場所: /lib/db.ts
 * 役割: データベース接続の設定を一元管理します。
 */
import sql from 'mssql';

// データベース接続設定
// .env.localファイルから環境変数を読み込みます
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || '', // DB_SERVERがundefinedの場合のエラーを防ぐため空文字を割り当て
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // Azure SQL Databaseには必須
    trustServerCertificate: false // 開発環境以外ではtrueにしない
  }
};

// データベースに接続してクエリを実行するためのヘルパー関数
export async function query(query: string, params?: { name: string, type: any, value: any }[]) {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();

    // パラメータを追加
    if (params) {
      params.forEach(p => {
        request.input(p.name, p.type, p.value);
      });
    }

    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error('SQL error', err);
    throw err; // エラーを呼び出し元に伝える
  }
}
