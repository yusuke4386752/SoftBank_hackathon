import { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const vrmDirectory = path.join(process.cwd(), 'public', 'vrm')

    const filenames = fs.readdirSync(vrmDirectory)

    // .vrm ファイルのみを対象にする
    const vrmFiles = filenames
      .filter((file) => file.endsWith('.vrm'))
      .map((file) => ({
        name: path.basename(file, '.vrm'), // 拡張子 .vrm を除いたファイル名
        path: `/vrm/${file}`, // Webからアクセスする際のパス
      }))

    res.status(200).json(vrmFiles)
  } catch (error) {
    console.error('Failed to get VRM list:', error)
    res.status(500).json({ message: 'Failed to get VRM list' })
  }
}
