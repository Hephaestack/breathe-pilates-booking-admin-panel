"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "./ui/card"
import { RefreshCw, Quote, Wifi, WifiOff } from "lucide-react"
import { Button } from "./ui/button"

// Local Pilates quotes as a LAST-RESORT fallback
const fallbackQuotes = [
  {
    text: "Pilates is complete coordination of body, mind, and spirit.",
    author: "Joseph Pilates",
    category: "Philosophy",
  },
  {
    text: "Physical fitness is the first requisite of happiness.",
    author: "Joseph Pilates",
    category: "Wellness",
  },
  // … (keep or trim as you like)
]

const getRandomImage = () => {
  const topics = [
    "pilates-studio",
    "yoga-meditation",
    "fitness-wellness",
    "mindfulness-zen",
    "stretching-flexibility",
    "balance-harmony",
    "peaceful-nature",
    "sunrise-motivation",
  ]
  return `https://source.unsplash.com/800x400/?${topics[Math.floor(Math.random() * topics.length)]}`
}

export function MotivationalQuote() {
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isOnline, setIsOnline] = useState(true)

  const fetchQuote = async () => {
    setLoading(true)
    setError(null)

    try {
      setIsOnline(navigator.onLine)

      if (!navigator.onLine) throw new Error("offline")

      const res = await fetch("/api/quote")
      if (!res.ok) throw new Error("api")

      const data = await res.json()
      setQuote({
        text: data.text,
        author: data.author,
        image: getRandomImage(),
      })
    } catch (e) {
      // Ultimate fallback
      const local = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)]
      setQuote({ ...local, image: getRandomImage() })
      setError(e.message === "offline" ? "Offline mode" : "API unavailable")
    } finally {
      setLoading(false)
      setLastUpdated(new Date())
    }
  }

  // Initial + hourly refresh
  useEffect(() => {
    fetchQuote()
    const id = setInterval(fetchQuote, 60 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  // Retry automatically when connection returns
  useEffect(() => {
    const online = () => {
      setIsOnline(true)
      fetchQuote()
    }
    const offline = () => setIsOnline(false)

    window.addEventListener("online", online)
    window.addEventListener("offline", offline)
    return () => {
      window.removeEventListener("online", online)
      window.removeEventListener("offline", offline)
    }
  }, [])

  const statusIcon = isOnline ? (
    <Wifi className="w-3 h-3 text-green-400" />
  ) : (
    <WifiOff className="w-3 h-3 text-red-400" />
  )

  if (loading && !quote) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden group">
      <CardContent className="p-0">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${quote.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Quote content */}
        <div className="relative p-6 h-64 flex flex-col justify-center text-white">
          <Quote className="w-8 h-8 text-blue-400 mb-4 opacity-80" />
          <blockquote className="italic text-lg md:text-xl font-medium mb-4">"{quote.text}"</blockquote>
          <cite className="text-blue-300 font-semibold text-right">— {quote.author}</cite>

          {/* Refresh button */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchQuote}
              disabled={loading}
              className="text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Status line */}
          <div className="absolute bottom-2 left-4 flex items-center gap-2 text-xs text-gray-300">
            {statusIcon}
            {lastUpdated && <span>Updated: {lastUpdated.toLocaleTimeString()}</span>}
            {error && <span className="text-yellow-300">• {error}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
