/*
 * ファイルの場所: /app/api/dashboard-data/route.ts
 * 役割: ポジティブ・ネガティブ別のキーワードランキング機能を追加します。
 * ★★★ このファイルの内容を全て以下のコードに置き換えてください ★★★
 */
import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import sql from 'mssql';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const themeId = searchParams.get('themeId');
    if (!themeId) return NextResponse.json({ message: 'Theme ID is required.' }, { status: 400 });
    
    const themeIdParam = [{ name: 'themeId', type: sql.Int, value: Number(themeId) }];

    // --- 感情分析データ (変更なし) ---
    const sentimentData = await query(
      `SELECT Sentiment, COUNT(*) as count FROM Opinions WHERE ThemeId = @themeId AND Sentiment IS NOT NULL GROUP BY Sentiment`,
      themeIdParam
    );

    // ★★★ 修正点: キーワード集計ロジックを更新 ★★★
    const allKeywordRecords = await query(
      `SELECT Keywords, Sentiment FROM Opinions WHERE ThemeId = @themeId AND Keywords IS NOT NULL`,
      themeIdParam
    );

    const keywordCounts: {
      overall: { [key: string]: number },
      positive: { [key: string]: number },
      negative: { [key: string]: number }
    } = { overall: {}, positive: {}, negative: {} };

    allKeywordRecords.forEach(record => {
      try {
        const keywords: string[] = JSON.parse(record.Keywords);
        const sentiment = record.Sentiment;
        keywords.forEach(keyword => {
          const lowerCaseKeyword = keyword.toLowerCase();
          keywordCounts.overall[lowerCaseKeyword] = (keywordCounts.overall[lowerCaseKeyword] || 0) + 1;
          if (sentiment === 'ポジティブ') {
            keywordCounts.positive[lowerCaseKeyword] = (keywordCounts.positive[lowerCaseKeyword] || 0) + 1;
          } else if (sentiment === 'ネガティブ') {
            keywordCounts.negative[lowerCaseKeyword] = (keywordCounts.negative[lowerCaseKeyword] || 0) + 1;
          }
        });
      } catch (e) { /* ignore parse error */ }
    });
    
    const rankKeywords = (counts: { [key: string]: number }) => Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 20).map(([name, value]) => ({ name, value }));
    const keywordRanking = {
      overall: rankKeywords(keywordCounts.overall),
      positive: rankKeywords(keywordCounts.positive),
      negative: rankKeywords(keywordCounts.negative),
    };

    // --- 時系列データ (変更なし) ---
    const timeSeriesData = await query(
        `SELECT CAST(AnalyzedAt AS DATE) as date, COUNT(*) as count FROM Opinions WHERE ThemeId = @themeId AND AnalyzedAt IS NOT NULL GROUP BY CAST(AnalyzedAt AS DATE) ORDER BY date ASC`,
        themeIdParam
    );
    
    return NextResponse.json({ sentimentData, keywordRanking, timeSeriesData });

  } catch (error: any) {
    console.error('Dashboard Data API Error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.', error: error.message }, { status: 500 });
  }
}
