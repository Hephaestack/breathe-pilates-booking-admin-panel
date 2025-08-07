"use client"

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import TraineeInfo from './TraineeInfo'

function TraineeInfoWrapper() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  
  if (!id) {
    return (
      <div className="min-h-screen p-2 bg-gray-50 sm:p-4">
        <div className="mx-auto max-w-7xl">
          <div className="py-8 text-lg text-center text-red-500">
            Δεν βρέθηκε η ταυτότητα του μαθητή
          </div>
        </div>
      </div>
    )
  }

  return <TraineeInfo id={id} />
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen p-2 bg-gray-50 sm:p-4">
        <div className="mx-auto max-w-7xl">
          <div className="py-8 text-lg text-center text-gray-500">
            Φόρτωση...
          </div>
        </div>
      </div>
    }>
      <TraineeInfoWrapper />
    </Suspense>
  )
}

