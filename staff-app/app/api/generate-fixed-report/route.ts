/*
 * ファイルの場所: /app/api/generate-fixed-report/route.ts
 * 役割: AIとの複数回の対話を通じて、本格的な分析レポートを生成します。
 * ★★★ この内容で新しいファイルを作成してください ★★★
 */
import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/db';
import sql from 'mssql';

// --- 型定義 ---
interface Opinion {
  id: number;
  opinion_text: string;
}

// --- プロンプト生成関数 ---

// 1. カテゴリ分類用のプロンプト
const createCategorizationPrompt = (opinions: Opinion[]): string => {
  const opinionTexts = opinions.map(o => `ID:${o.id} - "${o.opinion_text}"`).join('\n');
  return `
    以下の学生の意見リストを分析し、各意見IDに最もふさわしいカテゴリを一つだけ割り当ててください。
    カテゴリの選択肢は「施設・設備」「授業・学習」「人間関係」「校則」「部活動」「進路・将来」「その他」とします。
    結果は必ず指定されたJSON形式（{ "results": [{ "id": number, "category": string }] }）で出力してください。

    # 意見リスト:
    ${opinionTexts}
  `;
};

// 2. レポート本体生成用のプロンプト
const createReportGenerationPrompt = (themeTitle: string, opinions: { opinion_text: string, Category: string }[]): string => {
  const opinionTexts = opinions.map(o => `カテゴリ: ${o.Category} - "${o.opinion_text}"`).join('\n');
  return `
    あなたは優秀なデータアナリストです。以下の議論テーマと、それに関する学生たちの意見リストを分析し、指定されたJSON形式で詳細な分析レポートを作成してください。

    # 議論テーマ:
    ${themeTitle}

    # 分析対象の意見リスト:
    ${opinionTexts}

    # レポート作成の指示:
    1.  **categorySummaries**:
        -   各カテゴリについて、似ている意見をグループ化し、それぞれのグループの要点を一文で要約してください。
        -   各要約に、それが何件の意見をまとめたものかを示す "count" を含めてください。
    2.  **overallKeywords**:
        -   全ての意見から、頻出するキーワードや重要な概念を抽出し、出現回数順にランキングを作成してください。
    3.  **notableMinorityOpinions**:
        -   多数派の意見とは異なる、ユニークな視点や深く考えさせられる少数派の意見を2〜3件選出してください。
        -   なぜその意見が注目に値するのか、簡単な解説 "commentary" を加えてください。

    # 出力JSONの厳密なスキーマ:
    {
      "categorySummaries": [
        {
          "category": "string",
          "summaries": [ { "summary": "string", "count": "number" } ]
        }
      ],
      "overallKeywords": [ { "keyword": "string", "count": "number" } ],
      "notableMinorityOpinions": [ { "opinion": "string", "commentary": "string" } ]
    }
  `;
};

// --- メインAPI処理 ---
export async function POST(req: NextRequest) {
  try {
    const { themeId } = await req.json();
    if (!themeId) {
      return NextResponse.json({ message: 'Theme ID is required.' }, { status: 400 });
    }
    
    const themeResult = await query(`SELECT theme_title FROM Themes WHERE id = @themeId`, [{ name: 'themeId', type: sql.Int, value: themeId }]);
    if (themeResult.length === 0) {
      return NextResponse.json({ message: 'Theme not found.' }, { status: 404 });
    }
    const themeTitle = themeResult[0].theme_title;

    // --- AI処理 Part 1: カテゴリ分類 ---
    const opinionsForCategorization = await query(`SELECT id, opinion_text FROM Opinions WHERE ThemeId = @themeId AND Category IS NULL`, [{ name: 'themeId', type: sql.Int, value: themeId }]);

    if (opinionsForCategorization.length > 0) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const categorizationPrompt = createCategorizationPrompt(opinionsForCategorization);
      const categorizationPayload = {
        contents: [{ role: "user", parts: [{ text: categorizationPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      };

      const categorizationRes = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(categorizationPayload) });
      if (!categorizationRes.ok) throw new Error("Categorization API failed");

      const categorizationResult = await categorizationRes.json();
      const categorizedData = JSON.parse(categorizationResult.candidates[0].content.parts[0].text);

      // データベースを更新
      for (const item of categorizedData.results) {
        await query(`UPDATE Opinions SET Category = @category WHERE id = @id`, [
          { name: 'category', type: sql.NVarChar, value: item.category },
          { name: 'id', type: sql.Int, value: item.id }
        ]);
      }
    }

    // --- AI処理 Part 2: レポート本体の生成 ---
    const allOpinionsForReport = await query(`SELECT opinion_text, Category FROM Opinions WHERE ThemeId = @themeId AND Category IS NOT NULL`, [{ name: 'themeId', type: sql.Int, value: themeId }]);
    
    if (allOpinionsForReport.length === 0) {
      return NextResponse.json({ message: '分析対象の意見がありません。' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const reportGenPrompt = createReportGenerationPrompt(themeTitle, allOpinionsForReport);
    const reportGenPayload = {
      contents: [{ role: "user", parts: [{ text: reportGenPrompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    };

    const reportGenRes = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reportGenPayload) });
    if (!reportGenRes.ok) throw new Error("Report Generation API failed");

    const reportGenResult = await reportGenRes.json();
    const reportData = JSON.parse(reportGenResult.candidates[0].content.parts[0].text);

    // カテゴリごとの件数を集計してレポートに追加
    const categoryCounts: { [key: string]: number } = {};
    allOpinionsForReport.forEach(op => {
      categoryCounts[op.Category] = (categoryCounts[op.Category] || 0) + 1;
    });
    reportData.categoryBreakdown = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
    
    return NextResponse.json(reportData);

  } catch (error: any) {
    console.error('Generate Report API Error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred during report generation.', error: error.message }, { status: 500 });
  }
}
