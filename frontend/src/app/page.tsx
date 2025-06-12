"use client";
// @ts-ignore
import React from "react";
import { Aituber } from "@aituber/kit";
import { useState } from "react";

export default function Home() {
    // ① 状態（残り回数・ログ）
    const [count, setCount] = useState(0);
    const [log, setLog] = useState<string[]>([]);

    // ② ボタンが押されたときの処理（ここに書く！）
    const handleClick = async (type: string) => {
        if (count >= 3) return alert("もう使えません！");
        setCount(count + 1);

        try {
            const response = await fetch("/api/ask-ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type }),
            });

            const data = await response.json();

            // 返答をログに追加
            setLog((prev) => [...prev, `🧠 ${data.reply}`]);
        } catch (error) {
            console.error("🛑 フロントエンドでのエラー:", error);

            // エラーが起きたことをユーザーに伝える
            setLog((prev) => [...prev, "🧠 返答の取得中にエラーが起きました。"]);
        }
    };


    // ③ 画面に表示する要素
    return (
        <main className="p-4">
            <h1 className="text-xl font-bold mb-4">ココロボ画面</h1>

            <Aituber modelUrl="/models/default.vrm" width={300} height={500} autoStart={false} />

            <p className="my-2">🕒 残り使用回数: {3 - count} / 3</p>
            <div className="space-x-2 mb-4">
                <button onClick={() => handleClick("議論")} className="bg-red-500 text-white px-3 py-1 rounded">🟥 議論のヒント</button>
                <button onClick={() => handleClick("大津市")} className="bg-blue-500 text-white px-3 py-1 rounded">🟦 大津市のヒント</button>
                <button onClick={() => handleClick("具体例")} className="bg-yellow-400 px-3 py-1 rounded">🟨 具体例のヒント</button>
            </div>

            <h2 className="text-lg font-semibold">発言ログ</h2>
            <ul className="bg-gray-100 p-2 rounded">
                {log.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </main>
    );
}

// <Aituber modelUrl="/models/default.vrm" width={300} height={500} autoStart={false} />
