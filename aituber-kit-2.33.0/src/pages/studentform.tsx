import { useState, useEffect } from 'react'; // useEffectをインポート

// テーマの型を定義
interface Theme {
    Id: number;
    Title: string;
}

const StudentForm = () => {
    // テーマのリストを保存するためのstateを追加
    const [themes, setThemes] = useState<Theme[]>([]);
    const [themesLoading, setThemesLoading] = useState(true);

    const [theme, setTheme] = useState('');
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{ message: string; success: boolean } | null>(null);

    // ★★★ ページ読み込み時にテーマを取得する処理を追加 ★★★
    useEffect(() => {
        const fetchThemes = async () => {
            try {
                setThemesLoading(true);
                const response = await fetch('/api/getThemes');
                if (!response.ok) {
                    throw new Error('テーマの取得に失敗しました。');
                }
                const data = await response.json();
                setThemes(data);
            } catch (error) {
                console.error(error);
                // エラー時もフォームが使えるように、空の配列をセット
                setThemes([]);
            } finally {
                setThemesLoading(false);
            }
        };

        fetchThemes();
    }, []); // 空の配列を渡すことで、コンポーネントの初回マウント時のみ実行される

    const handleSubmit = async (e: React.FormEvent) => {
        // ... (handleSubmitのロジックは変更なし)
        e.preventDefault();
        if (!theme || !grade || !feedback) {
            alert('すべての項目を入力してください。');
            return;
        }
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const response = await fetch('/api/submitOpinion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme, grade, feedback }),
            });

            const result = await response.json();
            setSubmitStatus(result);

            if (response.ok) {
                setTheme('');
                setGrade('');
                setFeedback('');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            setSubmitStatus({ success: false, message: '送信中にエラーが発生しました。' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // ... (送信完了後のメッセージ表示部分は変更なし)
    if (submitStatus?.success) {
        return (
             <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
                    <h1 className="text-2xl font-bold mb-4 text-green-600">送信完了</h1>
                    <p>{submitStatus.message} ありがとうございました！</p>
                    <button 
                        onClick={() => setSubmitStatus(null)}
                        className="mt-6 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        新しい意見を投稿する
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">生徒意見投稿フォーム</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="theme" className="block text-gray-700 font-bold">
                            テーマ
                        </label>
                        {/* ★★★ 入力欄をselect（ドロップダウン）に変更 ★★★ */}
                        <select
                            id="theme"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            required
                            disabled={themesLoading}
                        >
                            <option value="">{themesLoading ? '読み込み中...' : 'テーマを選択してください'}</option>
                            {themes.map((themeItem) => (
                                <option key={themeItem.Id} value={themeItem.Title}>
                                    {themeItem.Title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* 学年とご意見のフォーム部分は変更なし */}
                    <div className="mb-4">
                        <label htmlFor="grade" className="block text-gray-700 font-bold">
                            学年
                        </label>
                        <select
                            id="grade"
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            required
                        >
                            <option value="">学年を選択してください</option>
                            <option value="中学1年">中学1年</option>
                            <option value="中学2年">中学2年</option>
                            <option value="中学3年">中学3年</option>
                            <option value="高校1年">高校1年</option>
                            <option value="高校2年">高校2年</option>
                            <option value="高校3年">高校3年</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="feedback" className="block text-gray-700 font-bold">
                            ご意見
                        </label>
                        <textarea
                            id="feedback"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full px-3 py-2 border rounded"
                            placeholder="あなたの意見を入力してください"
                            rows={6}
                            required
                        ></textarea>
                    </div>

                    {submitStatus && !submitStatus.success && (
                        <p className="text-red-500 mb-4">{submitStatus.message}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '送信中...' : '送信'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default StudentForm;