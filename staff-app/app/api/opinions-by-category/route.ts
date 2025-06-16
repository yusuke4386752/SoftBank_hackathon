/*
 * ファイルの場所: /app/api/opinions-by-category/route.ts
 * 役割: 指定されたテーマとカテゴリに属する意見を全て取得します。
 * ★★★ この内容で新しいファイルを作成してください ★★★
 */
import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import sql from 'mssql';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const themeId = searchParams.get('themeId');
    const category = searchParams.get('category');

    if (!themeId || !category) {
      return NextResponse.json({ message: 'Theme ID and Category are required.' }, { status: 400 });
    }

    const opinions = await query(
      `SELECT id, opinion_text, grade, created_at 
       FROM Opinions 
       WHERE ThemeId = @themeId AND Category = @category AND DeletedAt IS NULL 
       ORDER BY created_at DESC`,
      [
        { name: 'themeId', type: sql.Int, value: Number(themeId) },
        { name: 'category', type: sql.NVarChar, value: category }
      ]
    );

    const themeResult = await query(
      `SELECT theme_title FROM Themes WHERE id = @themeId`,
      [{ name: 'themeId', type: sql.Int, value: Number(themeId) }]
    );
    const themeTitle = themeResult.length > 0 ? themeResult[0].theme_title : '';

    return NextResponse.json({
      themeTitle,
      category,
      opinions,
    });

  } catch (error: any) {
    console.error('Opinions by Category API Error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.', error: error.message }, { status: 500 });
  }
}
