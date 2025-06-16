/*
 * ファイルの場所: /app/api/analyze/route.ts
 * 役割: 分析する意見の件数を選択できるように機能を拡張します。
 * ★★★ このファイルの内容を全て以下のコードに置き換えてください ★★★
 */
import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import sql from 'mssql';

// Gemini APIに渡すJSONの型定義
interface GeminiAnalysis {
  sentiment: 'ポジティブ' | 'ネガティブ' | 'ニュートラル';
  keywords: string[];
}

// AIに分析を依頼するプロンプトを生成する関数
const createPrompt = (opinionText: string): string => {
  return `
    以下の学生の意見を分析し、指定されたJSON形式で結果を返してください。

    # 分析対象の意見:
    "${opinionText}"

    # 出力形式のルール:
    - 感情は「ポジティブ」「ネガティブ」「ニュートラル」のいずれか一つを選択してください。
    - キーワードは、意見の要点を表す単語や短いフレーズを3〜5個抽出してください。
    - 必ず指定されたJSONスキーマに沿った形式で出力してください。
  `;
};

// メインのAPI処理
export async function POST(req: NextRequest) {
  try {
    const { themeId, limit } = await req.json(); // limitパラメータを追加
    if (!themeId) {
      return NextResponse.json({ message: 'Theme ID is required.' }, { status: 400 });
    }

    // ★★★ 修正点: limitに応じて取得件数を動的に変更 ★★★
    let opinionsQuery = `SELECT id, opinion_text FROM Opinions WHERE ThemeId = @themeId AND AnalyzedAt IS NULL`;
    if (typeof limit === 'number' && limit > 0) {
      opinionsQuery = `SELECT TOP ${limit} id, opinion_text FROM Opinions WHERE ThemeId = @themeId AND AnalyzedAt IS NULL`;
    } // 'all'の場合は制限なし

    const opinionsToAnalyze = await query(opinionsQuery, [
      { name: 'themeId', type: sql.Int, value: Number(themeId) }
    ]);

    if (opinionsToAnalyze.length === 0) {
      return NextResponse.json({ message: '分析対象の新しい意見はありません。' }, { status: 200 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in .env.local");
    }
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const schema = {
      type: "OBJECT",
      properties: {
        sentiment: { type: "STRING", enum: ["ポジティブ", "ネガティブ", "ニュートラル"] },
        keywords: { type: "ARRAY", items: { type: "STRING" } }
      },
      required: ["sentiment", "keywords"]
    };

    let analyzedCount = 0;
    await Promise.all(opinionsToAnalyze.map(async (opinion) => {
      try {
        const prompt = createPrompt(opinion.opinion_text);
        const payload = {
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", responseSchema: schema }
        };
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          console.error(`API Error for opinion ${opinion.id}:`, await response.text());
          return;
        }

        const result = await response.json();
        if (result.candidates && result.candidates.length > 0) {
          const analysis: GeminiAnalysis = JSON.parse(result.candidates[0].content.parts[0].text);
          await query(
            `UPDATE Opinions SET Sentiment = @sentiment, Keywords = @keywords, AnalyzedAt = GETDATE() WHERE id = @id`,
            [
              { name: 'sentiment', type: sql.NVarChar, value: analysis.sentiment },
              { name: 'keywords', type: sql.NVarChar, value: JSON.stringify(analysis.keywords) },
              { name: 'id', type: sql.Int, value: opinion.id }
            ]
          );
          analyzedCount++;
        }
      } catch (e) {
        console.error(`Error processing opinion ${opinion.id}:`, e);
      }
    }));

    return NextResponse.json({ message: `${analyzedCount}件の意見を分析しました。` });

  } catch (error: any) {
    console.error('Analysis API Error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.', error: error.message }, { status: 500 });
  }
}
