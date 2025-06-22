import { useCallback, useEffect } from 'react' // useEffect をインポート
import homeStore from '@/features/stores/home'
import settingsStore from '@/features/stores/settings'

export default function VrmViewer() {
  // ★★★ 1. ストアの値をリアクティブに取得する ★★★
  // これにより、selectedVrmPathが変更されると、このコンポーネントが再描画される
  const selectedVrmPath = settingsStore((s) => s.selectedVrmPath)

  // ★★★ 2. selectedVrmPathが変更された時に、VRMを再読み込みする処理を追加 ★★★
  useEffect(() => {
    const { viewer } = homeStore.getState()
    if (viewer.isLoaded && selectedVrmPath) {
      viewer.loadVrm(selectedVrmPath)
    }
  }, [selectedVrmPath]) // selectedVrmPathが変わるたびにこの処理が実行される

  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (canvas) {
        const { viewer } = homeStore.getState()

        // 初回読み込み
        if (!viewer.isLoaded) {
          viewer.setup(canvas)
          if (selectedVrmPath) {
            viewer.loadVrm(selectedVrmPath)
          }
        }

        // Drag and DropでVRMを差し替え
        canvas.addEventListener('dragover', function (event) {
          event.preventDefault()
        })

        canvas.addEventListener('drop', function (event) {
          event.preventDefault()

          const files = event.dataTransfer?.files
          if (!files) {
            return
          }

          const file = files[0]
          if (!file) {
            return
          }
          const file_type = file.name.split('.').pop()
          if (file_type === 'vrm') {
            const blob = new Blob([file], { type: 'application/octet-stream' })
            const url = window.URL.createObjectURL(blob)
            viewer.loadVrm(url)
            // ストアの選択パスも更新する
            settingsStore.setState({ selectedVrmPath: url })
          } else if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = function () {
              const image = reader.result as string
              image !== '' && homeStore.setState({ modalImage: image })
            }
          }
        })
      }
    },
    [selectedVrmPath]
  ) // selectedVrmPathを依存配列に追加

  return (
    <div className={'absolute top-0 left-0 w-screen h-[100svh] z-5'}>
      <canvas ref={canvasRef} className={'h-full w-full'}></canvas>
    </div>
  )
}
