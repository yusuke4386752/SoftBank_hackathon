/*
 * ファイルの場所: /app/api/themes/[id]/route.ts
 * 役割: 個別のテーマを操作（ソフトデリート/復元/完全削除）します。
 * ★★★ このファイルの内容を全て以下のコードに置き換えてください ★★★
 */
import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import sql from 'mssql';

// テーマのステータスを更新 (ソフトデリート / 復元)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const { action } = await req.json();
    let queryString = '';

    if (action === 'soft-delete') {
      queryString = 'UPDATE Themes SET DeletedAt = GETDATE() WHERE id = @id';
    } else if (action === 'restore') {
      queryString = 'UPDATE Themes SET DeletedAt = NULL WHERE id = @id';
    } else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }
    await query(queryString, [{ name: 'id', type: sql.Int, value: Number(id) }]);
    return NextResponse.json({ message: 'Theme status updated' }, { status: 200 });
  } catch (error: any) {
    console.error('API Error in PATCH /api/themes/[id]:', error);
    return NextResponse.json({ message: 'Error updating theme', error: error.message }, { status: 500 });
  }
}

// テーマを完全に削除 (ハードデリート)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {    
    await query('DELETE FROM Themes WHERE id = @id', [
      { name: 'id', type: sql.Int, value: Number(id) }
    ]);
    return NextResponse.json({ message: 'Theme permanently deleted' }, { status: 200 });
  } catch (error: any) {
    console.error('API Error in DELETE /api/themes/[id]:', error);
    return NextResponse.json({ message: 'Error deleting theme', error: error.message }, { status: 500 });
  }
}
