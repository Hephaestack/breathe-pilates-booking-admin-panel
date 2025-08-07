'use client'

import { SWRConfig } from 'swr'
import { swrConfig } from '../lib/swr-config'

export default function RootLayout({ children }) {
  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  )
}
