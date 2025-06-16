/*
 * ファイルの場所: /app/api/themes/route.ts
 * 役割: fetchAllパラメータを追加し、ページネーションを無視して全件取得できるようにします。
 * ★★★ このファイルの内容を全て以下のコードに置き換えてください ★★★
 */
import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import sql from 'mssql';

const THEMES_PER_PAGE = 10;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'active';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const keyword = searchParams.get('keyword') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';
    const fetchAll = searchParams.get('fetchAll') === 'true'; // 全件取得パラメータ

    const allowedSortBy = ['created_at', 'theme_title'];
    if (!allowedSortBy.includes(sortBy)) throw new Error('Invalid sort column');

    let whereClauses = [status === 'active' ? 'DeletedAt IS NULL' : 'DeletedAt IS NOT NULL'];
    const params = [];

    if (keyword) {
      whereClauses.push('theme_title LIKE @keyword');
      params.push({ name: 'keyword', type: sql.NVarChar, value: `%${keyword}%` });
    }

    const whereString = `WHERE ${whereClauses.join(' AND ')}`;

    // 全件取得モードでない場合のみ、総件数を取得
    let totalThemes = 0;
    if (!fetchAll) {
      const countQuery = `SELECT COUNT(*) AS total FROM Themes ${whereString}`;
      const countResult = await query(countQuery, params);
      totalThemes = countResult[0].total;
    }

    let dataQuery = `SELECT id, theme_title, created_at FROM Themes ${whereString} ORDER BY ${sortBy} ${sortOrder}`;

    // 全件取得モードでない場合のみ、ページネーションを適用
    if (!fetchAll) {
      const offset = (page - 1) * THEMES_PER_PAGE;
      dataQuery += ` OFFSET ${offset} ROWS FETCH NEXT ${THEMES_PER_PAGE} ROWS ONLY;`;
    }

    const themes = await query(dataQuery, params);
    
    return NextResponse.json({
      themes,
      totalPages: fetchAll ? 1 : Math.ceil(totalThemes / THEMES_PER_PAGE),
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Error fetching themes', error: error.message }, { status: 500 });
  }
}

// (POSTメソッドは変更なし)
export async function POST(req: NextRequest) {
  try {
    const { theme_title } = await req.json();
    if (!theme_title) return NextResponse.json({ message: 'Theme title is required' }, { status: 400 });
    await query('INSERT INTO Themes (theme_title) VALUES (@theme_title)', [{ name: 'theme_title', type: sql.NVarChar, value: theme_title }]);
    const newThemeResult = await query('SELECT TOP 1 id, theme_title FROM Themes ORDER BY created_at DESC');
    return NextResponse.json({ message: 'Theme created successfully', theme: newThemeResult[0] }, { status: 201 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Error creating theme', error: error.message }, { status: 500 });
  }
}
