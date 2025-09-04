'use client'

import { SWRConfig } from 'swr'
import { swrConfig } from '../lib/swr-config'
import { AdminProvider } from './contexts/AdminContext'
import { StudioProvider } from './contexts/StudioContext'

export default function RootLayout({ children }) {
  return (
    <SWRConfig value={swrConfig}>
      <AdminProvider>
        <StudioProvider>
          {children}
        </StudioProvider>
      </AdminProvider>
    </SWRConfig>
  )
}
