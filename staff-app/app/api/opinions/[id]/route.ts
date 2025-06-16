/*
 * ファイルの場所: /app/api/opinions/[id]/route.ts
 * 役割: 個別の意見を操作（ソフトデリート/復元/完全削除）します。
 */
import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import sql from 'mssql';

// 意見のステータスを更新 (ソフトデリート / 復元)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const { action } = await req.json(); // 'soft-delete' または 'restore'
    let queryString = '';

    if (action === 'soft-delete') {
      queryString = 'UPDATE Opinions SET DeletedAt = GETDATE() WHERE id = @id';
    } else if (action === 'restore') {
      queryString = 'UPDATE Opinions SET DeletedAt = NULL WHERE id = @id';
    } else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    await query(queryString, [{ name: 'id', type: sql.Int, value: Number(id) }]);
    return NextResponse.json({ message: 'Opinion status updated' }, { status: 200 });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Error updating opinion', error: error.message }, { status: 500 });
  }
}

// 意見を完全に削除 (ハードデリート)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    await query('DELETE FROM Opinions WHERE id = @id', [
      { name: 'id', type: sql.Int, value: Number(id) }
    ]);
    return NextResponse.json({ message: 'Opinion permanently deleted' }, { status: 200 });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Error deleting opinion', error: error.message }, { status: 500 });
  }
}
