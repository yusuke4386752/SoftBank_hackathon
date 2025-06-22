import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';

// データベース接続情報 (他のAPIファイルと共通)
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER!,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, // Azure SQL Databaseには必須
    trustServerCertificate: false
  }
};

// APIリクエストを処理するハンドラ
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // GETリクエスト以外は拒否
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // ★★★ configの中身を確認するために、この一行を追加しました ★★★
    console.log('Using DB config:', config);

    await sql.connect(config);
    
    // お客様のテーブル構造に合わせたSQLクエリ
    // id を Id に、theme_title を Title として取得します
    const result = await sql.query`SELECT id as Id, theme_title as Title FROM Themes ORDER BY id`;
    
    await sql.close();

    // 取得したテーマのリストをJSONとして返す
    return res.status(200).json(result.recordset);

  } catch (error) {
    console.error('Themes API error:', error);
    await sql.close();
    return res.status(500).json({ message: 'テーマの取得に失敗しました。' });
  }
}