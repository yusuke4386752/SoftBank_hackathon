import { useState } from 'react'

const StudentForm = () => {
    const [name, setName] = useState('')
    const [feedback, setFeedback] = useState('')
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // フォーム送信処理（例: API呼び出し）
        console.log('Name:', name)
        console.log('Feedback:', feedback)
        setSubmitted(true)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">生徒意見投稿フォーム</h1>
                {submitted ? (
                    <p className="text-green-500">ご意見を送信しました。ありがとうございました！</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-gray-700">
                                名前（任意）
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                                placeholder="名前を入力してください"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="feedback" className="block text-gray-700">
                                ご意見
                            </label>
                            <textarea
                                id="feedback"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="w-full px-3 py-2 border rounded"
                                placeholder="ご意見を入力してください"
                                rows={4}
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            送信
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

export default StudentForm