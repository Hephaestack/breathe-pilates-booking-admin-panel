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
  const [showDropdown, setShowDropdown] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(".dropdown-container")) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showDropdown])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Navigation */}
        <header className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="flex items-center justify-between p-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">Logo</span>
              </div>
            </div>

            {/* Navigation Categories */}
            <nav className="flex space-x-8">
              {/* Trainees with Click Dropdown */}
              <div className="relative dropdown-container">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <User className="w-4 h-4" />
                  <span>Trainees</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                </Button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowDropdown(false)
                          console.log("Add trainer clicked")
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Add Trainer
                      </button>
                      <button
                        onClick={() => {
                          setShowDropdown(false)
                          router.push("/trainers-list")
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        List of Trainers
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Button variant="ghost" className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4" />
                <span>Departments</span>
              </Button>
              <Button variant="ghost" className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span>Subscriptions</span>
              </Button>
              <Button
                variant="ghost"
                className="flex items-center space-x-2"
                onClick={() => router.push("/reservations")}
              >
                <Calendar className="w-4 h-4" />
                <span>Reservations</span>
              </Button>
            </nav>
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
              <CardTitle>Business Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: { color: "#000000", label: "Revenue (€)" },
                  members: { color: "#888888", label: "Active Members" },
                  classes: { color: "#FFFFFF", label: "Classes" },
                }}
              >
                <BarChart data={[
                  { month: "Jan", revenue: 4000, members: 80, classes: 120 },
                  { month: "Feb", revenue: 4500, members: 90, classes: 130 },
                  { month: "Mar", revenue: 5000, members: 100, classes: 140 },
                  { month: "Apr", revenue: 6000, members: 110, classes: 150 },
                  { month: "May", revenue: 6500, members: 112, classes: 165 },
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
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€6,500</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.1%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">112</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+14.3%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classes This Month</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">165</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+11.5%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2.1%</span> from last month
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
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Redirecting to login...</div>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <div className="bg-black text-white p-4 mb-4 flex justify-between items-center">
        <div>
          <p>Welcome to Admin Dashboard, {user.name}!</p>
        </div>
        <button onClick={handleLogout} className="bg-white hover:bg-gray-300 px-4 py-2 rounded text-black">
          Logout
        </button>
      </div>
      <Dashboard />
    </div>
  )
}
