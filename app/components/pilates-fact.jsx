"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Brain, RefreshCw } from "lucide-react"
import { Button } from "./ui/button"

// Interesting Pilates facts and benefits
const pilatesFacts = [
  {
    title: "Η Αρχή του Powerhouse",
    fact: "Ο Joseph Pilates αποκάλεσε τους μύες του κορμού 'powerhouse' - περιλαμβάνοντας τους βαθιούς κοιλιακούς μύες, το πυελικό έδαφος, το διάφραγμα και τον multifidus. Αυτή η ιδέα επανάστασε τον τρόπο που σκεφτόμαστε για τη σταθερότητα του κορμού.",
    category: "Ιστορία",
  },
  {
    title: "Σύνδεση Νου-Σώματος",
    fact: "Το Pilates αρχικά ονομαζόταν 'Contrology' επειδή δίνει έμφαση στον έλεγχο του νου πάνω στους μύες. Κάθε κίνηση απαιτεί πνευματική εστίαση και ακρίβεια.",
    category: "Φιλοσοφία",
  },
  {
    title: "Καταγωγή Αποκατάστασης",
    fact: "Το Pilates αναπτύχθηκε κατά τον Α' Παγκόσμιο Πόλεμο για να βοηθήσει στην αποκατάσταση τραυματισμένων στρατιωτών. Ο Joseph Pilates χρησιμοποίησε ελατήρια κρεβατιού και νοσοκομειακό εξοπλισμό για να δημιουργήσει ασκήσεις αντίστασης.",
    category: "Ιστορία",
  },
  {
    title: "Οφέλη Αναπνοής",
    fact: "Οι τεχνικές αναπνοής του Pilates μπορούν να αυξήσουν την πνευμονική χωρητικότητα έως και 15% και να βελτιώσουν την κυκλοφορία οξυγόνου σε όλο το σώμα.",
    category: "Υγεία",
  },
  {
    title: "Βελτίωση Στάσης",
    fact: "Η τακτική εξάσκηση του Pilates μπορεί να βελτιώσει τη στάση ενδυναμώνοντας τους βαθιούς σταθεροποιητικούς μύες και αυξάνοντας την επίγνωση της στοίχισης του σώματος.",
    category: "Οφέλη",
  },
  {
    title: "Ευελιξία & Δύναμη",
    fact: "Σε αντίθεση με πολλές μορφές άσκησης, το Pilates χτίζει ταυτόχρονα δύναμη και ευελιξία, δημιουργώντας μακριούς, αδύνατους μύες χωρίς όγκο.",
    category: "Οφέλη",
  },
  {
    title: "Ψυχική Υγεία",
    fact: "Μελέτες δείχνουν ότι το Pilates μπορεί να μειώσει το άγχος και την κατάθλιψη ενώ βελτιώνει τη διάθεση και την αυτοεκτίμηση μέσω της συνειδητής κίνησης.",
    category: "Ευεξία",
  },
  {
    title: "Πρόληψη Τραυματισμών",
    fact: "Το Pilates μειώνει τον κίνδυνο τραυματισμού έως και 40% βελτιώνοντας την επίγνωση του σώματος, την ισορροπία και το συντονισμό των μυών.",
    category: "Υγεία",
  },
]

const categoryColors = {
  "Ιστορία": "from-amber-500 to-orange-500",
  "Φιλοσοφία": "from-purple-500 to-indigo-500", 
  "Υγεία": "from-green-500 to-emerald-500",
  "Οφέλη": "from-blue-500 to-cyan-500",
  "Ευεξία": "from-pink-500 to-rose-500",
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
            <span className="text-lg">Γνωρίζατε ότι;</span>
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

        <div className="text-xs text-gray-500 text-right">Ανανεώνεται κάθε ώρα • Κάντε κλικ για περισσότερα</div>
      </CardContent>
    </Card>
  )
}
