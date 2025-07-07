"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Calendar,
  CreditCard,
  BookOpen,
  ChevronDown,
  TrendingUp,
  Users,
  Activity,
  DollarSign,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { MotivationalQuote } from "../components/motivational-quote"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

function Dashboard() {
  const router = useRouter()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(".dropdown-container")) {
        setShowDropdown(false)
      }
      if (showMobileMenu && !event.target.closest(".admin-navbar")) {
        setShowMobileMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showDropdown, showMobileMenu])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Navigation */}
        <header className="bg-white rounded-lg shadow-sm border mb-8 admin-navbar relative">
          <div className="flex items-center justify-between p-4 flex-wrap md:flex-nowrap">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">Logo</span>
              </div>
            </div>

            {/* Hamburger for mobile */}
            <button
              className="md:hidden ml-auto p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
              onClick={() => setShowMobileMenu((prev) => !prev)}
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>

            {/* Navigation Categories */}
            {(showMobileMenu || typeof window === 'undefined' || window.innerWidth >= 768) && (
              <nav
                className={`flex-col md:flex md:flex-row md:space-x-8 md:items-center w-full md:w-auto mt-4 md:mt-0 bg-white md:bg-transparent z-50 absolute md:static left-0 top-full md:top-auto md:left-auto shadow md:shadow-none border md:border-0 rounded-lg md:rounded-none p-4 md:p-0 ${showMobileMenu ? 'flex' : 'hidden md:flex'}`}
              >
                {/* Trainees with Click Dropdown */}
                <div className="relative dropdown-container mb-2 md:mb-0 flex items-center justify-center h-full">
                  <Button
                    variant="ghost"
                    className="flex items-center justify-center space-x-2 h-9 px-4 py-2"
                    style={{ minWidth: '120px' }}
                    onClick={() => setShowDropdown((prev) => !prev)}
                  >
                    <User className="w-4 h-4" />
                    <span className="flex-1 text-center">Ασκούμενοι</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                  </Button>
                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setShowDropdown(false)
                            setShowMobileMenu(false)
                            console.log("Add trainer clicked")
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Προσθήκη Ασκούμενου
                        </button>
                        <button
                          onClick={() => {
                            setShowDropdown(false)
                            setShowMobileMenu(false)
                            router.push("/trainers-list")
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Λίστα Ασκούμενων
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <Button variant="ghost" className="flex items-center space-x-2 mb-2 md:mb-0">
                  <BookOpen className="w-4 h-4" />
                  <span>Τμήματα</span>
                </Button>
                <Button variant="ghost" className="flex items-center space-x-2 mb-2 md:mb-0">
                  <CreditCard className="w-4 h-4" />
                  <span>Συνδρομές</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 mb-2 md:mb-0"
                  onClick={() => {
                    setShowMobileMenu(false)
                    router.push("/reservations")
                  }}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Κρατήσεις</span>
                </Button>
              </nav>
            )}
          </div>
        </header>

        {/* Motivational Section - Full Width */}
        <div className="mb-8">
          <MotivationalQuote />
        </div>

        {/* Business Info Chart - replaces Daily Inspiration & Pilates Fact */}
        <div className="mb-8">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Επισκόπηση Επιχείρησης</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: { color: "#6366f1", label: "Έσοδα (€)" },
                  members: { color: "#10b981", label: "Ενεργά Μέλη" },
                  classes: { color: "#f59e42", label: "Μαθήματα" },
                }}
              >
                <BarChart data={[
                  { month: "Ιαν", revenue: 4000, members: 80, classes: 120 },
                  { month: "Φεβ", revenue: 4500, members: 90, classes: 130 },
                  { month: "Μαρ", revenue: 5000, members: 100, classes: 140 },
                  { month: "Απρ", revenue: 6000, members: 110, classes: 150 },
                  { month: "Μαϊ", revenue: 6500, members: 112, classes: 165 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" />
                  <Bar dataKey="members" fill="var(--color-members)" />
                  <Bar dataKey="classes" fill="var(--color-classes)" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* KPI Cards - Enhanced Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Συνολικά Έσοδα</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€6,500</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.1%</span> από τον προηγούμενο μήνα
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ενεργά Μέλη</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">112</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+14.3%</span> από τον προηγούμενο μήνα
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Μαθήματα Αυτόν τον Μήνα</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">165</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+11.5%</span> από τον προηγούμενο μήνα
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Μέση Συμμετοχή</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2.1%</span> από τον προηγούμενο μήνα
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")

    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } else {
      router.push("/login")
    }
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("rememberedCredentials")
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Φόρτωση...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Μεταφορά στη σελίδα σύνδεσης...</div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div className="bg-black text-white p-4 mb-4 flex justify-between items-center">
        <div>
          <p>Καλώς ήρθατε στον Πίνακα Διαχείρισης, {user.name}!</p>
        </div>
        <button onClick={handleLogout} className="bg-white hover:bg-gray-300 px-4 py-2 rounded text-black">
          Αποσύνδεση
        </button>
      </div>
      <Dashboard />
    </div>
  )
}
