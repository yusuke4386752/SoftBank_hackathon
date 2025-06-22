import settingsStore from '@/features/stores/settings'
import { useEffect } from 'react'

const UsageTracker = () => {
  const {
    usageLimitEnabled,
    usageLimitCount,
    currentUsageCount,
    usageResetTimestamp,
    resetUsageTracker,
  } = settingsStore()

  // 時間が経過したらカウンターをリセットする
  useEffect(() => {
    if (!usageLimitEnabled) return

    const checkAndReset = () => {
      if (Date.now() > usageResetTimestamp) {
        resetUsageTracker()
      }
    }

    const intervalId = setInterval(checkAndReset, 1000) // 1秒ごとにチェック
    return () => clearInterval(intervalId)
  }, [usageLimitEnabled, usageResetTimestamp, resetUsageTracker])

  if (!usageLimitEnabled) {
    return null // 機能がOFFの場合は何も表示しない
  }

  const remaining = usageLimitCount - currentUsageCount
  const isAvailable = remaining > 0

  return (
    <div className="absolute top-4 right-48 p-2 bg-gray-800 bg-opacity-70 rounded-lg text-white text-sm shadow-lg">
      <span>AI使用回数: </span>
      <span
        className={`font-bold ${isAvailable ? 'text-green-400' : 'text-red-400'}`}
      >
        残り {remaining < 0 ? 0 : remaining} / {usageLimitCount} 回
      </span>
    </div>
  )
}

export default UsageTracker
