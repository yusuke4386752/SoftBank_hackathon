import settingsStore from '@/features/stores/settings'
import { CharacterPreset } from '@/features/stores/settings'

const AIPersonalitySelector = () => {
  // settings.tsから、設定済みのペルソナ（システムプロンプト）と現在の選択を取得
  const { presets, selectedCharacterPreset, setSelectedCharacterPreset } =
    settingsStore()

  // ボタンがクリックされたときに、選択中のシステムプロンプトを更新する関数
  const handleSelectPersonality = (preset: CharacterPreset) => {
    setSelectedCharacterPreset(preset)
  }

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md mx-auto z-20">
      <div className="flex justify-center space-x-2 p-2 bg-white bg-opacity-80 rounded-lg shadow-md">
        {/* ★★★ presetsの後に `?` を追加 ★★★ */}
        {presets?.map((p) => (
          <button
            key={p.name}
            onClick={() => handleSelectPersonality(p)}
            className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${
              selectedCharacterPreset?.name === p.name // selectedCharacterPresetにも念のため`?`を追加
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default AIPersonalitySelector
