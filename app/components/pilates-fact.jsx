"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Brain, RefreshCw } from "lucide-react"
import { Button } from "./ui/button"

// Interesting Pilates facts and benefits
const pilatesFacts = [
  {
    title: "The Powerhouse Principle",
    fact: "Joseph Pilates called the core muscles the 'powerhouse' - comprising the deep abdominal muscles, pelvic floor, diaphragm, and multifidus. This concept revolutionized how we think about core stability.",
    category: "History",
  },
  {
    title: "Mind-Body Connection",
    fact: "Pilates was originally called 'Contrology' because it emphasizes the mind's control over muscles. Every movement requires mental focus and precision.",
    category: "Philosophy",
  },
  {
    title: "Rehabilitation Origins",
    fact: "Pilates was developed during WWI to help rehabilitate injured soldiers. Joseph Pilates used bed springs and hospital equipment to create resistance exercises.",
    category: "History",
  },
  {
    title: "Breathing Benefits",
    fact: "Pilates breathing techniques can increase lung capacity by up to 15% and improve oxygen circulation throughout the body.",
    category: "Health",
  },
  {
    title: "Posture Improvement",
    fact: "Regular Pilates practice can improve posture by strengthening deep stabilizing muscles and increasing awareness of body alignment.",
    category: "Benefits",
  },
  {
    title: "Flexibility & Strength",
    fact: "Unlike many exercise forms, Pilates simultaneously builds strength and flexibility, creating long, lean muscles without bulk.",
    category: "Benefits",
  },
  {
    title: "Mental Health",
    fact: "Studies show that Pilates can reduce anxiety and depression while improving mood and self-esteem through mindful movement.",
    category: "Wellness",
  },
  {
    title: "Injury Prevention",
    fact: "Pilates reduces injury risk by up to 40% by improving body awareness, balance, and muscle coordination.",
    category: "Health",
  },
]

const categoryColors = {
  History: "from-amber-500 to-orange-500",
  Philosophy: "from-purple-500 to-indigo-500",
  Health: "from-green-500 to-emerald-500",
  Benefits: "from-blue-500 to-cyan-500",
  Wellness: "from-pink-500 to-rose-500",
}

export function PilatesFact() {
  const [currentFact, setCurrentFact] = useState(null)
  const [loading, setLoading] = useState(false)

  const getRandomFact = () => {
    setLoading(true)
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * pilatesFacts.length)
      setCurrentFact(pilatesFacts[randomIndex])
      setLoading(false)
    }, 500) // Small delay for smooth transition
  }

  useEffect(() => {
    getRandomFact()

    // Change fact every hour
    const interval = setInterval(getRandomFact, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  if (!currentFact) return null

  const gradientClass = categoryColors[currentFact.category] || "from-gray-500 to-gray-600"

  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-5`} />

      <CardHeader className="relative">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            <span className="text-lg">Did You Know?</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={getRandomFact}
            disabled={loading}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${gradientClass}`}>
              {currentFact.category}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 text-lg">{currentFact.title}</h3>

          <p className="text-gray-700 leading-relaxed">{currentFact.fact}</p>
        </div>

        <div className="text-xs text-gray-500 text-right">Refreshes hourly • Click refresh for more</div>
      </CardContent>
    </Card>
  )
}
