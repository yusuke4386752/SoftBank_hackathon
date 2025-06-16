/*
 * ファイルの場所: /app/api/csv-export/route.ts
 * 役割: フィルターとソート条件に基づいて意見データを全件取得し、CSV形式で返します。
 */
import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import sql from 'mssql';

// CSVの特殊文字をエスケープする関数
const escapeCsvField = (field: any): string => {
  const stringField = String(field ?? '');
  if (/[",\n\r]/.test(stringField)) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

export async function GET(req: NextRequest) {
  try {
    // フロントエンドから渡される全てのフィルター条件を取得
    const { searchParams } = new URL(req.url);
    const themeId = searchParams.get('themeId') || 'all';
    const status = searchParams.get('status') || 'active';
    const grade = searchParams.get('grade') || 'all';
    const keyword = searchParams.get('keyword') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';
    
    // APIのロジックは意見取得APIとほぼ同じだが、ページネーションは行わない
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

    // ページネーションを適用せず、全件取得する
    const dataQuery = `
      SELECT o.id AS Id, o.discussion_theme AS ThemeTitle, o.grade AS Grade, o.opinion_text AS Content, o.created_at AS SubmittedAt
      FROM Opinions o ${whereString}
      ORDER BY ${sortColumn} ${sortOrder};
    `;
    const opinions = await query(dataQuery, params);

    // CSV文字列を生成
    const headers = ["ID", "テーマ", "学年", "意見内容", "投稿日時"];
    const csvRows = opinions.map((op: any) => [
      escapeCsvField(op.Id),
      escapeCsvField(op.ThemeTitle),
      escapeCsvField(op.Grade),
      escapeCsvField(op.Content),
      escapeCsvField(new Date(op.SubmittedAt).toLocaleString('ja-JP'))
    ].join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');

    // BOMを先頭に追加してExcelでの文字化けを防ぐ
    const bom = '\uFEFF';

    return new Response(bom + csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="opinions_export.csv"`,
      },
    });

  } catch (error: any) {
    console.error('CSV Export API Error:', error);
    return NextResponse.json({ message: 'Error exporting CSV', error: error.message }, { status: 500 });
  }
}
