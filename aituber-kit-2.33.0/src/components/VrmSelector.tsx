import { useEffect } from 'react'
import settingsStore from '@/features/stores/settings'

const VrmSelector = () => {
  const { vrmList, selectedVrmPath, setVrmList, setSelectedVrmPath } =
    settingsStore()

  useEffect(() => {
    // APIからVRMのリストを取得してストアに保存
    const fetchVrmList = async () => {
      try {
        const response = await fetch('/api/vrm-list')
        const data = await response.json()
        setVrmList(data)
        // リストの先頭のVRMをデフォルトとして設定（もし選択されていなければ）
        if (!selectedVrmPath && data.length > 0) {
          setSelectedVrmPath(data[0].path)
        }
      } catch (error) {
        console.error('Failed to fetch VRM list:', error)
      }
    }
    fetchVrmList()
  }, [setVrmList, setSelectedVrmPath, selectedVrmPath])

  const handleVrmChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVrmPath(event.target.value)
  }

  return (
    <div className="p-4">
      <label
        htmlFor="vrm-select"
        className="block text-sm font-medium text-gray-700"
      >
        アバターを選択
      </label>
      <select
        id="vrm-select"
        value={selectedVrmPath}
        onChange={handleVrmChange}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        {vrmList.map((vrm) => (
          <option key={vrm.path} value={vrm.path}>
            {vrm.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default VrmSelector
