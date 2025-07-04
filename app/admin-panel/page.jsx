"use client"

import { useEffect, useState } from "react"
// import { motion } from "framer-motion"
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
import { MotivationalQuote } from "../components/motivational-quote"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "../components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

function Dashboard() {
  const router = useRouter()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showTraineeSub, setShowTraineeSub] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(".main-burger-dropdown")) {
        setShowDropdown(false)
        setShowTraineeSub(false)
      }
      if (showTraineeSub && !event.target.closest(".trainee-sub-dropdown")) {
        setShowTraineeSub(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showDropdown, showTraineeSub])

  return (
    <div className="relative min-h-screen">
      {/* Backdrop blur overlay for mobile menu */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300 sm:hidden ${
          showDropdown ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => {
          setShowDropdown(false)
          setShowTraineeSub(false)
        }}
      />

      {/* Main content with blur effect when menu is open */}
      <div
        className={`min-h-screen p-2 sm:p-4 bg-gradient-to-br from-gray-100 via-gray-50 to-white ${showTraineeSub ? "overflow-hidden" : ""}`}
      >
        <div className="relative z-50 p-2 mx-auto border border-gray-300 shadow max-w-7xl bg-white/95 rounded-2xl sm:p-4">
          {/* Header Navigation */}
          <header className="mb-8 bg-white border border-gray-300 shadow rounded-xl">
            <div className="flex flex-row items-center justify-between gap-4 p-3 sm:p-4 min-h-[64px]">
              {/* Logo on the left */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 bg-black border-2 border-gray-200 rounded-full shadow-md">
                  <span className="text-lg font-bold text-white">Logo</span>
                </div>
              </div>

              {/* Responsive Navigation */}
              {/* Mobile: Burger menu */}
              <nav className="relative flex flex-col items-center w-auto ml-auto sm:hidden">
                <div className="flex flex-col items-center w-full main-burger-dropdown">
                  <button
                    type="button"
                    aria-label="Open main menu"
                    className={`flex items-center justify-center w-12 h-12 border border-gray-400 rounded-full shadow bg-gray-50 transition-transform duration-300 ${showDropdown ? "rotate-90" : ""}`}
                    onClick={() => {
                      setShowDropdown(!showDropdown)
                      if (showDropdown) setShowTraineeSub(false)
                    }}
                  >
                    {/* Burger icon animation */}
                    <span className="relative flex flex-col items-center justify-center w-6 h-6">
                      <span
                        className={`block h-0.5 w-6 bg-gray-700 rounded transition-all duration-300 ${showDropdown ? "rotate-45 translate-y-2" : ""}`}
                      ></span>
                      <span
                        className={`block h-0.5 w-6 bg-gray-700 rounded my-1 transition-all duration-300 ${showDropdown ? "opacity-0" : ""}`}
                      ></span>
                      <span
                        className={`block h-0.5 w-6 bg-gray-700 rounded transition-all duration-300 ${showDropdown ? "-rotate-45 -translate-y-2" : ""}`}
                      ></span>
                    </span>
                  </button>

                  {/* Main Dropdown Menu - Fixed positioning */}
                  <div
                    className={`absolute right-0 top-full mt-2 w-64 bg-white border-2 border-gray-300 rounded-xl shadow-lg transition-all duration-300 ${showDropdown ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"} z-50`}
                    style={{ minWidth: "16rem" }}
                  >
                    <div className="relative flex flex-col items-center w-full gap-2 py-3">
                      {/* Trainees with sub-dropdown */}
                      <div className="relative z-20 flex flex-col items-center w-full trainee-sub-dropdown">
                        <button
                          type="button"
                          className="flex items-center justify-between w-56 gap-2 px-4 py-2 mx-auto text-gray-700 transition-colors border border-gray-400 rounded-lg hover:bg-gray-100"
                          onClick={() => setShowTraineeSub((v) => !v)}
                        >
                          <span className="flex items-center gap-2 mx-auto">
                            <User className="w-4 h-4" />
                            Trainees
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${showTraineeSub ? "rotate-180" : ""}`}
                          />
                        </button>

                        {/* Trainee Sub Dropdown - Fixed positioning */}
                        <div
                          className={`absolute left-1/2 -translate-x-1/2 top-full mt-2 w-52 bg-white border-2 border-gray-400 rounded-xl shadow-lg transition-all duration-300 ${showTraineeSub ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"} z-50`}
                          style={{ minWidth: "180px" }}
                        >
                          <div className="flex flex-col items-center w-full gap-2 py-3">
                            <button
                              onClick={() => {
                                setShowDropdown(false)
                                setShowTraineeSub(false)
                                router.push("/add-trainee")
                              }}
                              className="px-4 py-2 mx-auto text-center text-gray-700 transition-colors border border-gray-400 rounded-lg w-44 hover:bg-gray-100"
                            >
                              Add Trainee
                            </button>
                            <button
                              onClick={() => {
                                setShowDropdown(false)
                                setShowTraineeSub(false)
                                router.push("/trainee-list")
                              }}
                              className="px-4 py-2 mx-auto text-center text-gray-700 transition-colors border border-gray-400 rounded-lg w-44 hover:bg-gray-100"
                            >
                              List of Trainees
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Blur the rest of the menu when trainee sub-dropdown is open (MOBILE ONLY) */}
                      <div
                        className={`flex flex-col items-center w-full gap-2 transition-all duration-300 ${showTraineeSub ? "filter blur-sm pointer-events-none select-none" : ""}`}
                      >
                        {/* Other main menu items */}
                        <button className="flex items-center justify-center w-56 gap-2 px-4 py-2 mx-auto text-gray-700 transition-colors border border-gray-400 rounded-lg hover:bg-gray-100">
                          <BookOpen className="w-4 h-4" /> Departments
                        </button>
                        <button className="flex items-center justify-center w-56 gap-2 px-4 py-2 mx-auto text-gray-700 transition-colors border border-gray-400 rounded-lg hover:bg-gray-100">
                          <CreditCard className="w-4 h-4" /> Subscriptions
                        </button>
                        <button
                          onClick={() => {
                            setShowDropdown(false)
                            setShowTraineeSub(false)
                            router.push("/reservations")
                          }}
                          className="flex items-center justify-center w-56 gap-2 px-4 py-2 mx-auto text-gray-700 transition-colors border border-gray-400 rounded-lg hover:bg-gray-100"
                        >
                          <Calendar className="w-4 h-4" /> Reservations
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </nav>

              {/* Desktop: Horizontal navbar */}
              <nav className="flex-row items-center hidden gap-4 ml-auto sm:flex">
                {/* Trainees dropdown */}
                <div className="relative trainee-sub-dropdown">
                  <button
                    type="button"
                    className="flex items-center justify-between gap-2 px-4 py-2 text-gray-700 transition-colors border border-gray-400 rounded-lg hover:bg-gray-100 min-w-[140px]"
                    onClick={() => setShowTraineeSub((v) => !v)}
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Trainees
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showTraineeSub ? "rotate-180" : ""}`} />
                  </button>

                  {/* Trainee Sub Dropdown */}
                  <div
                    className={`absolute left-0 mt-2 w-52 bg-white border-2 border-gray-400 rounded-xl shadow-lg transition-all duration-300 ${showTraineeSub ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"} z-50`}
                    style={{ minWidth: "180px", top: "100%" }}
                  >
                    <div className="flex flex-col items-center w-full gap-2 py-3">
                      <button
                        onClick={() => {
                          setShowTraineeSub(false)
                          router.push("/add-trainee")
                        }}
                        className="px-4 py-2 mx-auto text-center text-gray-700 transition-colors border border-gray-400 rounded-lg w-44 hover:bg-gray-100"
                      >
                        Add Trainee
                      </button>
                      <button
                        onClick={() => {
                          setShowTraineeSub(false)
                          router.push("/trainee-list")
                        }}
                        className="px-4 py-2 mx-auto text-center text-gray-700 transition-colors border border-gray-400 rounded-lg w-44 hover:bg-gray-100"
                      >
                        List of Trainees
                      </button>
                    </div>
                  </div>
                </div>

                {/* No blur on desktop */}
                <div className="flex flex-row items-center gap-4 transition-all duration-300">
                  <button className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 transition-colors border border-gray-400 rounded-lg hover:bg-gray-100 min-w-[140px]">
                    <BookOpen className="w-4 h-4" /> Departments
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 transition-colors border border-gray-400 rounded-lg hover:bg-gray-100 min-w-[140px]">
                    <CreditCard className="w-4 h-4" /> Subscriptions
                  </button>
                  <button
                    onClick={() => {
                      setShowTraineeSub(false)
                      router.push("/reservations")
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 transition-colors border border-gray-400 rounded-lg hover:bg-gray-100 min-w-[140px]"
                  >
                    <Calendar className="w-4 h-4" /> Reservations
                  </button>
                </div>
              </nav>
            </div>
          </header>

          {/* Content sections with conditional blur */}
          <div className={`transition-all duration-300 ${showDropdown ? "sm:blur-none blur-sm" : ""}`}>
            {/* Motivational Section - Full Width */}
            <div className="relative z-10 flex justify-end w-full mb-8">
              <div className="w-full p-4 border border-gray-200 shadow bg-white/95 rounded-xl">
                <MotivationalQuote />
              </div>
            </div>

            {/* Business Info Chart - replaces Daily Inspiration & Pilates Fact */}
            <div className="mb-8">
              <Card className="h-full border border-gray-200 shadow rounded-xl bg-white/95">
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
                    <BarChart
                      data={[
                        { month: "Jan", revenue: 4000, members: 80, classes: 120 },
                        { month: "Feb", revenue: 4500, members: 90, classes: 130 },
                        { month: "Mar", revenue: 5000, members: 100, classes: 140 },
                        { month: "Apr", revenue: 6000, members: 110, classes: 150 },
                        { month: "May", revenue: 6500, members: 112, classes: 165 },
                      ]}
                    >
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
            <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="border border-gray-200 shadow rounded-xl bg-white/95">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€6,500</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+12.1%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow rounded-xl bg-white/95">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">112</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+14.3%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow rounded-xl bg-white/95">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Classes This Month</CardTitle>
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">165</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+11.5%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow rounded-xl bg-white/95">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
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
      <div className="flex items-center justify-between p-4 mb-4 text-white bg-black">
        <div>
          <p>Welcome to Admin Dashboard, {user.name}!</p>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 text-black bg-white rounded hover:bg-gray-300">
          Logout
        </button>
      </div>
      <Dashboard />
    </div>
  )
}
