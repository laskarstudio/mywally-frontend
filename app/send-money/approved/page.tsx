'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

function CheckBadge() {
  return (
    <div className="w-12 h-12 rounded-full bg-success border-4 border-white flex items-center justify-center shadow-md">
      <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
        <path d="M1.5 7l5 5L16.5 1.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export default function ApprovedPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col flex-1 bg-white">

      {/* Purple header with curved bottom */}
      <div className="bg-primary rounded-b-[40px] flex-shrink-0 pb-6">
        <div className="px-6 pt-4 text-center">
          <h1 className="text-white font-bold text-2xl leading-snug">
            Your transaction<br />has been approved<br />by your family!
          </h1>
        </div>
      </div>

      {/* Wally illustration — overlaps purple/white boundary */}
      <div className="flex-shrink-0 flex justify-center -mt-14 mb-6 relative z-10">
        <div className="relative">
          <Image
            src="/assets/my-wally-help.png"
            alt="Approved"
            width={140}
            height={140}
            className="object-contain"
          />
          <div className="absolute bottom-0 right-0">
            <CheckBadge />
          </div>
        </div>
      </div>

      {/* Amount + details */}
      <div className="flex-1 flex flex-col items-center justify-between px-6 pb-10">
        <div className="text-center">
          <p className="text-primary font-bold text-4xl">RM500.00</p>
          <p className="text-muted text-base mt-1">Sent to Ahmad Ali</p>
        </div>

        {/* Back to home */}
        <button
          onClick={() => router.replace('/dashboard')}
          className="w-full h-[52px] rounded-2xl bg-primary text-white font-bold text-base active:opacity-80 transition-opacity"
        >
          Back to Home
        </button>
      </div>

    </div>
  )
}
