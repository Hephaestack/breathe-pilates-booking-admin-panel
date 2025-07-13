"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Calendar, Heart, Sparkles } from "lucide-react"

// Daily pilates tips and inspiration
const dailyTips = [
  {
    day: 0, // Sunday
    tip: "Κυριακή Ανανέωσης: Αφιερώστε χρόνο για απαλό stretching και ειλικρινή αναπνοή για να προετοιμαστείτε για την εβδομάδα που έρχεται.",
    focus: "Ενσυνειδητότητα & Αποκατάσταση",
    color: "from-purple-500 to-pink-500",
  },
  {
    day: 1, // Monday
    tip: "Δευτέρα Κινήτρου: Ξεκινήστε την εβδομάδα δυνατά με ασκήσεις εστιασμένες στον κορμό. Το powerhouse σας είναι το θεμέλιό σας!",
    focus: "Δύναμη Κορμού",
    color: "from-blue-500 to-cyan-500",
  },
  {
    day: 2, // Tuesday
    tip: "Τρίτη Τεχνικής: Εστιάστε στην ακρίβεια παρά στην ταχύτητα. Η ποιοτική κίνηση δημιουργεί μόνιμη αλλαγή.",
    focus: "Ακρίβεια & Έλεγχος",
    color: "from-green-500 to-teal-500",
  },
  {
    day: 3, // Wednesday
    tip: "Τετάρτη Ευεξίας: Θυμηθείτε να αναπνέετε βαθιά. Η αναπνοή σας είναι η γέφυρα μεταξύ νου και σώματος.",
    focus: "Αναπνοή & Ροή",
    color: "from-yellow-500 to-orange-500",
  },
  {
    day: 4, // Thursday
    tip: "Πέμπτη Δύναμης: Προκαλέστε τον εαυτό σας με ασκήσεις ισορροπίας. Η σταθερότητα έρχεται από μέσα.",
    focus: "Ισορροπία & Σταθερότητα",
    color: "from-red-500 to-pink-500",
  },
  {
    day: 5, // Friday
    tip: "Παρασκευή Ευελιξίας: Κλείστε την εβδομάδα με stretching και επιμήκυνση. Το σώμα σας θα σας ευχαριστήσει!",
    focus: "Ευελιξία & Μήκος",
    color: "from-indigo-500 to-purple-500",
  },
  {
    day: 6, // Saturday
    tip: "Σάββατο Αυτοφροντίδας: Ακούστε το σώμα σας. Η ξεκούραση είναι το ίδιο σημαντική με την κίνηση.",
    focus: "Αποκατάσταση & Αυτοφροντίδα",
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

  const dayNames = ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο"]
  const currentDay = dayNames[currentTime.getDay()]

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${currentTip.color} opacity-10`} />

      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5 text-blue-600" />
          Καθημερινή Έμπνευση - {currentDay}
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
              <span className="font-medium text-gray-600">Εστίαση: {currentTip.focus}</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-right">Ενημερώνεται καθημερινά στα μεσάνυχτα</div>
      </CardContent>
    </Card>
  )
}
