# 🧠 こころ・プロジェクト - Kokoro Project

> 子どもたちのリアルな声を、社会へ届ける  
> 中高生の議論支援AI × 意見提出Webアプリ

---

## 🚀 概要

「こころ・プロジェクト」は、  
中高生のグループディスカッションを支援するAIアバター「ココロボ」と、  
その意見を大津市に届けるためのWebアプリを組み合わせたプロジェクトです。

生徒が自分の言葉で意見を考え、AIからの問いをヒントに深め、市に届ける。  
その流れを一気通貫で支援します。

---

## 実際の使用画面

<img width="1596" alt="スクリーンショット 2025-07-10 10 26 29" src="https://github.com/user-attachments/assets/9c0f5844-6c0d-403c-a57b-22570f162b2a" />
<img width="1220" alt="スクリーンショット 2025-07-10 10 25 47" src="https://github.com/user-attachments/assets/cb92c45d-71e5-4e48-9ba3-d5be7149e0dd" />
<img width="1217" alt="スクリーンショット 2025-07-10 10 26 07" src="https://github.com/user-attachments/assets/67342718-f445-4f90-a959-1f821655ec8f" />


## 🎯 特徴

- 💡 AIアバターは「正解」ではなく**問いかけ・ヒント**を提示
- 🧠 **AIの使用回数に制限**を設け、議論に戦略性・ゲーム性を導入
- 📡 **意見はそのままの形で大津市に提出**し、子どもたちの本音を届ける

---

## 📚 主な機能

### 💬 ディスカッション支援

- 🟥 「議論のヒントをもらう」
- 🟦 「大津市のヒントをもらう」
- 🟨 「具体例をもらう」
- ⏳ 使用回数表示（例：残り 2 / 3）
- 🧏 Whisper APIによるリアルタイム音声認識（予定）

### 🗳️ 意見提出・閲覧機能

- 学年＋意見をアプリから提出
- 大津市職員は一覧表示・PDF出力・フィルタ可能

---

## 🧩 技術構成

| 項目             | 使用技術                             |
|------------------|--------------------------------------|
| フロントエンド   | Next.js / AiTuberKit                 |
| バックエンド     | Server Actions (Next.js)             |
| 音声認識（予定） | Whisper API                          |
| データベース     | Azure SQL Database                   |
| AI基盤           | Dify / Gemini API + RAG構成          |

---

## 🗄️ データベース構成

<img width="746" alt="DataBase-diagram" src="https://github.com/user-attachments/assets/52544971-66e9-4bd6-95af-9aad681245b8" />

---

## 🏛️ 大津市職員向け画面構成

<img width="755" alt="otsu-UI" src="https://github.com/user-attachments/assets/04aaeac3-17b0-421b-a777-18fc90e7ff84" />

## 🔁 生徒向け議論支援画面（AiTuberKit）

<img width="749" alt="student-UI" src="https://github.com/user-attachments/assets/c5e53931-f4e6-42db-919b-985bb9fcdb9f" />

---

## 🏗️ 今後の展望

- 🎭 表情・音声からの感情推定
- 🏫 学校現場での導入実験
- 🌏 他自治体・企業への展開

---

## 🧑‍💻 開発・ライセンス

- 本プロジェクトは**非営利・教育目的**で運用されています。
- 技術協力や実証実験パートナーを募集中です。

---

## 開発者リーダー

森永悠介（yusuke4386752）
