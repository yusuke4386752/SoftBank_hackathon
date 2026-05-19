// app/api/ask-ai/route.ts
export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        /**
  * ここでフロントエンドからのリクエストを受け取っているがundefined
  * フロントエンドからはJSON形式で質問を送ることを想定
  */
        const { query } = await req.json(); // フロントから受け取った質問


        const res = await fetch("https://api.dify.ai/v1/chat-messages", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.DIFY_API_KEY}`, // .env.localから読み取る
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: "iPhone 13 Pro Maxの仕様は何ですか？",
                inputs: {},              // 必須、空でOK
                response_mode: "blocking", // or "streaming"
                user: "user-001",        // 任意の識別子（固定でOK）
                conversation_id: "",     // 空でOK（連続会話するなら後で使う）
                files: []                // 今は使わないなら空配列
            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("🛑 Dify APIエラー:", errorText);
            return Response.json({ reply: "AIとの通信に失敗しました。" }, { status: 500 });
        }

        const data = await res.json();

        return Response.json({
            reply: data.answer || "AIの返答がありませんでした。",
        });

    } catch (error) {
        console.error("❌ route.ts での例外:", error);
        return Response.json({ reply: "サーバーエラーが発生しました。" }, { status: 500 });
    }
}
