/*
 * ファイルの場所: /app/api/opinions/route.ts
 * 役割: 意見の並び替え機能を追加します。
 * ★★★ このファイルの内容を全て以下のコードに置き換えてください ★★★
 */
import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import sql from 'mssql';

const OPINIONS_PER_PAGE = 20;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const themeId = searchParams.get('themeId') || 'all';
    const status = searchParams.get('status') || 'active';
    const grade = searchParams.get('grade') || 'all';
    const keyword = searchParams.get('keyword') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';

    const offset = (page - 1) * OPINIONS_PER_PAGE;
    
    const allowedSortBy: { [key: string]: string } = { 'created_at': 'o.created_at', 'grade': 'o.grade' };
    if (!Object.keys(allowedSortBy).includes(sortBy)) {
      throw new Error('Invalid sort column');
    }
    const sortColumn = allowedSortBy[sortBy];


    let whereClauses = [status === 'active' ? 'o.DeletedAt IS NULL' : 'o.DeletedAt IS NOT NULL'];
    const params = [];

    if (themeId !== 'all') { whereClauses.push('o.ThemeId = @themeId'); params.push({ name: 'themeId', type: sql.Int, value: Number(themeId) }); }
    if (grade !== 'all') { whereClauses.push('o.grade = @grade'); params.push({ name: 'grade', type: sql.NVarChar, value: grade }); }
    if (keyword) { whereClauses.push('o.opinion_text LIKE @keyword'); params.push({ name: 'keyword', type: sql.NVarChar, value: `%${keyword}%` }); }
    
    const whereString = `WHERE ${whereClauses.join(' AND ')}`;

    const countQuery = `SELECT COUNT(*) AS total FROM Opinions o ${whereString}`;
    const countResult = await query(countQuery, params);
    const totalOpinions = countResult[0].total;

    const dataQuery = `
      SELECT o.id AS Id, o.grade AS Grade, o.opinion_text AS Content, o.created_at AS SubmittedAt, o.discussion_theme AS ThemeTitle, o.ThemeId AS ThemeId
      FROM Opinions o ${whereString}
      ORDER BY ${sortColumn} ${sortOrder}
      OFFSET ${offset} ROWS FETCH NEXT ${OPINIONS_PER_PAGE} ROWS ONLY;
    `;
    const opinions = await query(dataQuery, params);

    return NextResponse.json({ opinions, totalPages: Math.ceil(totalOpinions / OPINIONS_PER_PAGE) });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Error fetching opinions', error: error.message }, { status: 500 });
  }
}
