import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';

// データベース接続情報
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
  // POSTリクエスト以外は拒否
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { theme, grade, feedback } = req.body;

    // 必須項目チェック
    if (!theme || !grade || !feedback) {
      return res.status(400).json({ success: false, message: '必須項目が不足しています。' });
    }

    await sql.connect(config);
    await sql.query`
      INSERT INTO Opinions (discussion_theme, grade, opinion_text) 
      VALUES (${theme}, ${grade}, ${feedback})
    `;
    await sql.close();

    return res.status(200).json({ success: true, message: 'ご意見を送信しました。' });

  } catch (error) {
    console.error('Database API error:', error);
    await sql.close(); // エラー時も接続を閉じる
    return res.status(500).json({ success: false, message: 'データベースへの保存に失敗しました。' });
  }
}