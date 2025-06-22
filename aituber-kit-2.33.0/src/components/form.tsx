import { useCallback, useEffect, useState } from 'react'
import settingsStore, { CharacterPreset } from '@/features/stores/settings'
import homeStore from '@/features/stores/home'
import menuStore from '@/features/stores/menu'
import slideStore from '@/features/stores/slide'
import { handleSendChatFn } from '../features/chat/handlers'
import { MessageInputContainer } from './messageInputContainer'
import { PresetQuestionButtons } from './presetQuestionButtons'
import { SlideText } from './slideText'
import AIPersonalitySelector from './AIPersonalitySelector'
import UsageTracker from './UsageTracker' // ★★★ 回数表示UIをインポート ★★★

export const Form = () => {
  const modalImage = homeStore((s) => s.modalImage)
  const webcamStatus = homeStore((s) => s.webcamStatus)
  const captureStatus = homeStore((s) => s.captureStatus)
  const slideMode = settingsStore((s) => s.slideMode)
  const slideVisible = menuStore((s) => s.slideVisible)
  const slidePlaying = slideStore((s) => s.isPlaying)
  const chatProcessingCount = homeStore((s) => s.chatProcessingCount)

  const { systemPrompt, selectedCharacterPreset } = settingsStore((s) => ({
    systemPrompt: s.systemPrompt,
    selectedCharacterPreset: s.selectedCharacterPreset,
  }))

  const [delayedText, setDelayedText] = useState('')
  const handleSendChat = handleSendChatFn()

  useEffect(() => {
    if (delayedText && modalImage) {
      handleSendChat(delayedText, systemPrompt, selectedCharacterPreset.apiType)
      setDelayedText('')
    }
  }, [
    modalImage,
    delayedText,
    handleSendChat,
    systemPrompt,
    selectedCharacterPreset,
  ])

  const hookSendChat = useCallback(
    (text: string) => {
      if (!homeStore.getState().modalImage) {
        homeStore.setState({ triggerShutter: true })
      }

      if (webcamStatus || captureStatus) {
        setDelayedText(text)
      } else {
        handleSendChat(text, systemPrompt, selectedCharacterPreset.apiType)
      }
    },
    [
      handleSendChat,
      webcamStatus,
      captureStatus,
      setDelayedText,
      systemPrompt,
      selectedCharacterPreset,
    ]
  )

  return slideMode &&
    slideVisible &&
    (slidePlaying || chatProcessingCount !== 0) ? (
    <SlideText />
  ) : (
    <>
      <UsageTracker /> {/* ★★★ 回数表示UIをここに配置 ★★★ */}
      <AIPersonalitySelector />
      <PresetQuestionButtons onSelectQuestion={hookSendChat} />
      <MessageInputContainer onChatProcessStart={hookSendChat} />
    </>
  )
}
