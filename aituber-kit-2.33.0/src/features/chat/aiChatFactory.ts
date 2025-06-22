import { Message } from '@/features/messages/messages'
import { AIService, CharacterPreset } from '@/features/constants/settings' // ★ CharacterPresetを追加インポート
import { getDifyChatResponseStream } from './difyChat'
import { getVercelAIChatResponseStream } from './vercelAIChat'
import settingsStore from '@/features/stores/settings'
import { getOpenAIAudioChatResponseStream } from '@/features/chat/openAIAudioChat'

// ★★★ 関数がapiTypeを受け取るように変更 ★★★
export async function getAIChatResponseStream(
  messages: Message[],
  apiType: CharacterPreset['apiType']
): Promise<ReadableStream<string> | null> {
  const ss = settingsStore.getState()

  // ★★★ ここからが追加・修正したロジック ★★★

  // apiTypeに基づいて使用するAPIキーを決定
  // この部分は仕様書にあったDifyをAIプラットフォームとして想定しています
  let apiKey = ''
  if (apiType === 'DEBATE') {
    apiKey = process.env.DIFY_DEBATE_KEY || ''
  } else if (apiType === 'OTSU') {
    apiKey = process.env.DIFY_OTSU_KEY || ''
  } else if (apiType === 'EXAMPLE') {
    apiKey = process.env.DIFY_EXAMPLE_KEY || ''
  }

  // apiTypeが指定され、対応するAPIキーが見つかった場合は、Difyを強制的に使用
  if (apiType && apiKey) {
    return getDifyChatResponseStream(
      messages,
      apiKey, // 選択されたペルソナに対応するAPIキーを使用
      ss.difyUrl || '',
      ss.difyConversationId
    )
  }

  // ★★★ ここまでが追加・修正したロジック ★★★

  // 以下は、apiTypeが指定されなかった場合の、元のフォールバック処理
  if (ss.selectAIService == 'openai' && ss.audioMode) {
    return getOpenAIAudioChatResponseStream(messages)
  }

  switch (ss.selectAIService as AIService) {
    case 'openai':
    case 'anthropic':
    case 'google':
    case 'azure':
    case 'groq':
    case 'cohere':
    case 'mistralai':
    case 'perplexity':
    case 'fireworks':
    case 'deepseek':
    case 'lmstudio':
    case 'ollama':
    case 'custom-api':
      return getVercelAIChatResponseStream(messages)
    case 'dify':
      // Difyが選択されているが、apiTypeが指定されていない場合のデフォルト動作
      return getDifyChatResponseStream(
        messages,
        ss.difyKey || '',
        ss.difyUrl || '',
        ss.difyConversationId
      )
    default:
      throw new Error(`Unsupported AI service: ${ss.selectAIService}`)
  }
}
