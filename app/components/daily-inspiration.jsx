"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Calendar, Heart, Sparkles } from "lucide-react"

// Daily pilates tips and inspiration
const dailyTips = [
  {
    day: 0, // Sunday
    tip: "Sunday Reset: Take time for gentle stretching and mindful breathing to prepare for the week ahead.",
    focus: "Mindfulness & Recovery",
    color: "from-purple-500 to-pink-500",
  },
  {
    day: 1, // Monday
    tip: "Monday Motivation: Start your week strong with core-focused exercises. Your powerhouse is your foundation!",
    focus: "Core Strength",
    color: "from-blue-500 to-cyan-500",
  },
  {
    day: 2, // Tuesday
    tip: "Tuesday Technique: Focus on precision over speed. Quality movement creates lasting change.",
    focus: "Precision & Control",
    color: "from-green-500 to-teal-500",
  },
  {
    day: 3, // Wednesday
    tip: "Wednesday Wellness: Remember to breathe deeply. Your breath is the bridge between mind and body.",
    focus: "Breathing & Flow",
    color: "from-yellow-500 to-orange-500",
  },
  {
    day: 4, // Thursday
    tip: "Thursday Strength: Challenge yourself with balance exercises. Stability comes from within.",
    focus: "Balance & Stability",
    color: "from-red-500 to-pink-500",
  },
  {
    day: 5, // Friday
    tip: "Friday Flexibility: End your week with stretching and lengthening. Your body will thank you!",
    focus: "Flexibility & Length",
    color: "from-indigo-500 to-purple-500",
  },
  {
    day: 6, // Saturday
    tip: "Saturday Self-Care: Listen to your body. Rest is just as important as movement.",
    focus: "Recovery & Self-Care",
    color: "from-pink-500 to-rose-500",
  },
]

export function DailyInspiration() {
  const [currentTip, setCurrentTip] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const updateTip = () => {
      const now = new Date()
      const dayOfWeek = now.getDay()
      setCurrentTip(dailyTips[dayOfWeek])
      setCurrentTime(now)
    }

    updateTip()

    // Update every hour
    const interval = setInterval(updateTip, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  if (!currentTip) return null

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const currentDay = dayNames[currentTime.getDay()]

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${currentTip.color} opacity-10`} />

      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5 text-blue-600" />
          Daily Inspiration - {currentDay}
        </CardTitle>
      </CardHeader>

      <CardContent className="relative space-y-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full bg-gradient-to-br ${currentTip.color}`}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-gray-700 leading-relaxed mb-2">{currentTip.tip}</p>
            <div className="flex items-center gap-2 text-sm">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="font-medium text-gray-600">Focus: {currentTip.focus}</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-right">Updates daily at midnight</div>
      </CardContent>
    </Card>
  )
}
