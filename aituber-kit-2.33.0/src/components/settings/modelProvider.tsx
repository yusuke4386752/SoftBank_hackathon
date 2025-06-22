import { useTranslation } from 'react-i18next'
import menuStore from '@/features/stores/menu'
import settingsStore from '@/features/stores/settings'
import slideStore from '@/features/stores/slide'
import { Link } from '../link'
import { TextButton } from '../textButton'
import { useCallback } from 'react'
import Image from 'next/image'
import { Listbox } from '@headlessui/react'
import {
  multiModalAIServices,
  googleSearchGroundingModels,
} from '@/features/stores/settings'
import {
  AudioModeInputType,
  OpenAITTSVoice,
  RealtimeAPIModeContentType,
  RealtimeAPIModeVoice,
  RealtimeAPIModeAzureVoice,
} from '@/features/constants/settings'
import toastStore from '@/features/stores/toast'
import webSocketStore from '@/features/stores/websocketStore'

// AIサービスロゴのパスを定義
const aiServiceLogos = {
  openai: '/images/ai-logos/openai.svg',
  anthropic: '/images/ai-logos/anthropic.svg',
  google: '/images/ai-logos/google.svg',
  azure: '/images/ai-logos/azure.svg',
  groq: '/images/ai-logos/groq.svg',
  cohere: '/images/ai-logos/cohere.svg',
  mistralai: '/images/ai-logos/mistralai.svg',
  perplexity: '/images/ai-logos/perplexity.svg',
  fireworks: '/images/ai-logos/fireworks.svg',
  deepseek: '/images/ai-logos/deepseek.svg',
  lmstudio: '/images/ai-logos/lmstudio.svg',
  ollama: '/images/ai-logos/ollama.svg',
  dify: '/images/ai-logos/dify.svg',
  'custom-api': '/images/ai-logos/custom-api.svg',
}

// ロゴを表示するコンポーネント
const ServiceLogo = ({ service }: { service: keyof typeof aiServiceLogos }) => {
  return (
    <div
      className="inline-flex items-center justify-center mr-2"
      style={{ width: '32px', height: '32px' }}
    >
      <Image
        src={aiServiceLogos[service]}
        alt={`${service} logo`}
        width={24}
        height={24}
        style={{ objectFit: 'contain' }}
      />
    </div>
  )
}

const ModelProvider = () => {
  const settings = settingsStore()
  const { t } = useTranslation()

  // AIサービスの選択肢を定義
  const aiServiceOptions = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'google', label: 'Google Gemini' },
    { value: 'azure', label: 'Azure OpenAI' },
    { value: 'groq', label: 'Groq' },
    { value: 'cohere', label: 'Cohere' },
    { value: 'mistralai', label: 'Mistral AI' },
    { value: 'perplexity', label: 'Perplexity' },
    { value: 'fireworks', label: 'Fireworks' },
    { value: 'deepseek', label: 'DeepSeek' },
    { value: 'lmstudio', label: 'LM Studio' },
    { value: 'ollama', label: 'Ollama' },
    { value: 'dify', label: 'Dify' },
    { value: 'custom-api', label: 'Custom API' },
  ]

  // オブジェクトを定義して、各AIサービスのデフォルトモデルを保存する
  const defaultModels = {
    openai: 'gpt-4o-2024-11-20',
    anthropic: 'claude-3-5-sonnet-20241022',
    google: 'gemini-1.5-flash-latest',
    azure: '',
    groq: 'gemma2-9b-it',
    cohere: 'command-r-plus',
    mistralai: 'mistral-large-latest',
    perplexity: 'llama-3-sonar-large-32k-online',
    fireworks: 'accounts/fireworks/models/firefunction-v2',
    deepseek: 'deepseek-chat',
    lmstudio: '',
    ollama: '',
    dify: '',
    'custom-api': '',
  }

  const handleAIServiceChange = useCallback(
    (newService: keyof typeof defaultModels) => {
      settingsStore.setState({
        selectAIService: newService,
        selectAIModel: defaultModels[newService],
      })

      if (!multiModalAIServices.includes(newService as any)) {
        menuStore.setState({ showWebcam: false })

        settingsStore.setState({
          conversationContinuityMode: false,
          slideMode: false,
        })
        slideStore.setState({
          isPlaying: false,
        })
      }

      if (newService !== 'openai' && newService !== 'azure') {
        settingsStore.setState({ realtimeAPIMode: false })
      }

      if (newService === 'google') {
        if (!googleSearchGroundingModels.includes(settings.selectAIModel as any)) {
          settingsStore.setState({ useSearchGrounding: false })
        }
      }
    },
    [settings.selectAIModel]
  )

  const handleRealtimeAPIModeChange = useCallback((newMode: boolean) => {
    settingsStore.setState({
      realtimeAPIMode: newMode,
    })
    if (newMode) {
      settingsStore.setState({
        audioMode: false,
        speechRecognitionMode: 'browser',
        selectAIModel: 'gpt-4o-realtime-preview-2024-12-17',
        initialSpeechTimeout: 0,
        noSpeechTimeout: 0,
        showSilenceProgressBar: false,
        continuousMicListeningMode: false,
      })
    }
  }, [])

  const handleAudioModeChange = useCallback((newMode: boolean) => {
    settingsStore.setState({
      audioMode: newMode,
    })
    if (newMode) {
      settingsStore.setState({
        realtimeAPIMode: false,
        speechRecognitionMode: 'browser',
        selectAIModel: 'gpt-4o-audio-preview-2024-12-17',
      })
    } else {
      settingsStore.setState({
        selectAIModel: 'gpt-4o-2024-11-20',
      })
    }
  }, [])

  const handleUpdate = useCallback(() => {
    const wsManager = webSocketStore.getState().wsManager
    if (!wsManager || !wsManager.reconnect()) {
      toastStore.getState().addToast({
        message: t('Toasts.WebSocketReconnectFailed'),
        type: 'error',
        duration: 3000,
      })
    }
  }, [t])

  const selectedServiceOption = aiServiceOptions.find(
    (option) => option.value === settings.selectAIService
  )

  return settings.externalLinkageMode ? null : (
    <div className="mt-6">
      <div className="my-4 text-xl font-bold">{t('SelectAIService')}</div>
      <div className="my-2">
        <Listbox
          value={settings.selectAIService}
          onChange={(value) =>
            handleAIServiceChange(value as keyof typeof defaultModels)
          }
        >
          <div className="relative inline-block min-w-[240px]">
            <Listbox.Button className="w-full px-4 py-2 bg-white hover:bg-white-hover rounded-lg flex items-center cursor-pointer">
              <ServiceLogo
                service={settings.selectAIService as keyof typeof aiServiceLogos}
              />
              <span>{selectedServiceOption?.label}</span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 top-[-170px] w-auto min-w-full overflow-auto rounded-lg bg-white py-2 shadow-lg focus:outline-none">
              {aiServiceOptions.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 px-4 whitespace-nowrap ${
                      active ? 'bg-white-hover' : ''
                    }`
                  }
                >
                  {({ selected }) => (
                    <div className="flex items-center">
                      <ServiceLogo
                        service={option.value as keyof typeof aiServiceLogos}
                      />
                      <span
                        className={selected ? 'font-medium' : 'font-normal'}
                      >
                        {option.label}
                      </span>
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>
      
      {(() => {
        if (settings.selectAIService === 'openai') {
          return (
            <>
              {/* OpenAIのUI */}
            </>
          );
        } else if (settings.selectAIService === 'dify') {
          return (
            <>
              <div className="my-6">
                <div className="my-4">{t('DifyInfo')}</div>
                <div className="my-4 text-xl font-bold">
                  {t('DifyAPIKeyLabel')}
                </div>
                <input
                  className="text-ellipsis px-4 py-2 w-col-span-2 bg-white hover:bg-white-hover rounded-lg"
                  type="text"
                  placeholder="..."
                  value={settings.difyKey}
                  onChange={(e) =>
                    settingsStore.setState({ difyKey: e.target.value })
                  }
                />
              </div>
              <div className="my-6">
                <div className="my-4 text-xl font-bold">{t('EnterURL')}</div>
                <div className="my-4">{t('DifyInfo3')}</div>
                <input
                  className="text-ellipsis px-4 py-2 w-col-span-2 bg-white hover:bg-white-hover rounded-lg"
                  type="text"
                  placeholder="https://api.dify.ai/v1"
                  value={settings.difyUrl}
                  onChange={(e) =>
                    settingsStore.setState({ difyUrl: e.target.value })
                  }
                />
              </div>
            </>
          );
        }
        // ... 他のAIサービスも同様に続く ...
      })()}

      {/* ... その他の設定UI ... */}

      {/* ★★★ AI使用回数制限の設定UI ★★★ */}
      <div className="my-12 border-t pt-8">
        <div className="my-4 text-xl font-bold">AI 使用回数制限</div>
        <div className="my-4 text-sm">AIとの対話回数を、指定した時間内で指定した回数に制限します。</div>

        <div className="my-6">
          <div className="my-4 font-bold">回数制限を有効にする</div>
          <TextButton
            onClick={() => {
              settingsStore.setState({
                usageLimitEnabled: !settings.usageLimitEnabled,
              })
            }}
          >
            {settings.usageLimitEnabled ? 'オン' : 'オフ'}
          </TextButton>
        </div>

        {settings.usageLimitEnabled && (
          <>
            <div className="my-6">
              <label htmlFor="usage-limit-count" className="my-4 font-bold block">上限回数</label>
              <input
                id="usage-limit-count"
                type="number"
                min="1"
                className="px-4 py-2 w-24 bg-white hover:bg-white-hover rounded-lg border border-gray-300"
                value={settings.usageLimitCount}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value >= 1) {
                    settingsStore.setState({ usageLimitCount: value });
                  }
                }}
              />
              <span className="ml-2">回</span>
            </div>

            <div className="my-6">
              <label htmlFor="usage-limit-time" className="my-4 font-bold block">リセット時間（分）</label>
              <input
                id="usage-limit-time"
                type="number"
                min="1"
                className="px-4 py-2 w-24 bg-white hover:bg-white-hover rounded-lg border border-gray-300"
                value={settings.usageLimitTime}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value >= 1) {
                    settingsStore.setState({ usageLimitTime: value });
                  }
                }}
              />
              <span className="ml-2">分ごと</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ModelProvider