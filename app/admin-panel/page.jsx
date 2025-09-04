"use client"
import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAdmin } from "../contexts/AdminContext"
import { useStudio } from "../contexts/StudioContext"
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
  Building2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { MotivationalQuote } from "../components/motivational-quote"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, ResponsiveContainer } from "recharts"


function Dashboard() {
  const router = useRouter()
  const { adminInfo, loadingAdmin, isAuthenticated } = useAdmin()
  const { selectedStudio, setSelectedStudio, studios, loadingStudios, filteredData, isMounted } = useStudio()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileDropdown, setShowMobileDropdown] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [showStudioDropdown, setShowStudioDropdown] = useState(false)
  const isMobile = useIsMobile()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(".dropdown-container")) {
        setShowDropdown(false)
      }
      if (showStudioDropdown && !event.target.closest(".studio-dropdown-container")) {
        setShowStudioDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showDropdown, showStudioDropdown])

  // New MobileNav component (robust, same styling)
  const MobileNav = ({ open, onClose }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const navRef = useRef();

    // Close menu on outside click
    useEffect(() => {
      if (!open) return;
      const handleClick = (e) => {
        if (navRef.current && !navRef.current.contains(e.target)) {
          setShowDropdown(false);
          onClose();
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, [open, onClose]);

    // Prevent scroll when menu is open
    useEffect(() => {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
    }, [open]);

    return (
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex">
            {/* Overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-black/40 backdrop-blur-sm"
              aria-hidden="true"
              onClick={onClose}
            />
            {/* Drawer */}
            <motion.nav
              ref={navRef}
              className="relative flex flex-col w-4/5 h-full max-w-xs ml-auto bg-white shadow-2xl"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
          <div className="flex items-center justify-between px-4 py-4 border-b">
            <span className="text-lg font-bold">Μενού</span>
            <button
              className="p-2 rounded hover:bg-gray-100 focus:outline-none"
              onClick={onClose}
              aria-label="Κλείσιμο μενού"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ul className="flex flex-col flex-1 gap-2 px-4 py-6 ">
            {/* Studio Selection */}
            <li className="mb-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="block mb-2 text-sm font-medium text-gray-700">Επιλογή Studio</label>
                <select
                  value={selectedStudio}
                  onChange={(e) => setSelectedStudio(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loadingStudios}
                >
                  <option value="">
                    {loadingStudios ? "Φόρτωση..." : "Επιλέξτε Studio (Απαιτείται)"}
                  </option>
                  {studios.filter(studio => studio && studio.id && studio.name).map((studio) => (
                    <option key={`mobile-${studio.id}`} value={studio.id}>
                      {studio.name}
                    </option>
                  ))}
                </select>
              </div>
            </li>
            {/* Trainees Dropdown */}
            <li>
              <button
                className="flex items-center justify-between w-full px-3 py-3 text-base font-semibold rounded hover:bg-gray-100 focus:outline-none"
                onClick={() => setShowDropdown((prev) => !prev)}
                aria-expanded={showDropdown}
                aria-controls="trainee-mobile-dropdown"
                type="button"
              >
                <span className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Ασκούμενοι
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {showDropdown && (
                  <motion.div
                    id="trainee-mobile-dropdown"
                    initial={{ height: 0, opacity: 1, y: 0 }}
                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: -10 }}
                    transition={{ height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.18 }, y: { duration: 0.18 } }}
                    className="pl-8 mt-1 overflow-hidden"
                    style={{ pointerEvents: showDropdown ? 'auto' : 'none' }}
                  >
                    <ul className="flex flex-col gap-1">
                      <li>
                        <button
                          className="w-full px-2 py-2 text-sm font-medium text-left rounded hover:bg-gray-100"
                          onClick={() => {
                            setShowDropdown(false);
                            onClose();
                            router.push("/add-trainee");
                          }}
                          type="button"
                        >
                          Προσθήκη Ασκούμενου
                        </button>
                      </li>
                      <li>
                        <button
                          className="w-full px-2 py-2 text-sm font-medium text-left rounded hover:bg-gray-100"
                          onClick={() => {
                            setShowDropdown(false);
                            onClose();
                            router.push("/trainee-list");
                          }}
                          type="button"
                        >
                          Λίστα Ασκούμενων
                        </button>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
            <li>
            <button
                  className="flex items-center w-full gap-2 px-3 py-3 text-base font-semibold rounded hover:bg-gray-100 focus:outline-none"
                  onClick={() => {
                    setShowDropdown(false);
                    onClose();
                    router.push("/classes");
                  }}
                          type="button"
                        >
                <BookOpen className="w-5 h-5" />
                Τμήματα
              </button>
            </li>
            <li>
              <button
                className="flex items-center w-full gap-2 px-3 py-3 text-base font-semibold rounded hover:bg-gray-100 focus:outline-none"
                onClick={onClose}
              >
                <CreditCard className="w-5 h-5" />
                Συνδρομές
              </button>
            </li>
            <li>
              <button
                className="flex items-center w-full gap-2 px-3 py-3 text-base font-semibold rounded hover:bg-gray-100 focus:outline-none"
                onClick={() => {
                  setShowDropdown(false);
                  onClose();
                  router.push("/reservations");
                }}
              >
                <Calendar className="w-5 h-5" />
                Κρατήσεις
              </button>
            </li>
          </ul>
          <style jsx>{`
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </motion.nav>
        </div>
      )}
    </AnimatePresence>
    )
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        {/* Header Navigation */}
        <header className="relative mb-8 bg-white border rounded-lg shadow-sm admin-navbar">
          <div className="flex flex-wrap items-center justify-between p-4 md:flex-nowrap">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 overflow-hidden bg-white shadow-md shadow-black">
                <img
                  src="/logo_pilates_edit.jpg"
                  alt="Pilates Logo"
                  className="object-contain w-10 h-10"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </div>
              <span className="ml-2 text-xs font-bold tracking-wide text-gray-700 whitespace-nowrap" style={{ letterSpacing: '0.04em' }}>
                Breathe Pilates Dashboard
              </span>
            </div>
            {/* Hamburger for mobile */}
            <button
              className="p-2 ml-auto rounded md:hidden focus:outline-none focus:ring-2 focus:ring-gray-300"
              onClick={() => setShowMobileMenu(true)}
              aria-label="Open menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Desktop Navigation */}
            <nav className="absolute left-0 z-50 flex-col hidden w-full p-4 mt-4 bg-white border rounded-lg shadow md:flex-row md:space-x-8 md:items-center md:w-auto md:mt-0 md:bg-transparent md:static top-full md:top-auto md:left-auto md:shadow-none md:border-0 md:rounded-none md:p-0 md:flex">
                {/* Studio Selection Dropdown */}
                <div className="relative flex items-center justify-center h-full mb-2 studio-dropdown-container md:mb-0">
                  <Button
                    variant="ghost"
                    className="flex items-center justify-center px-4 py-2 space-x-2 h-9 bg-blue-50 hover:bg-blue-100"
                    style={{ minWidth: "150px" }}
                    onClick={() => setShowStudioDropdown((prev) => !prev)}
                  >
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="flex-1 text-center text-blue-700 font-medium">
                      {loadingStudios 
                        ? "Φόρτωση..." 
                        : selectedStudio 
                          ? studios.find(s => s.id === selectedStudio)?.name || "Studio"
                          : "Επιλέξτε Studio (Απαιτείται)"
                      }
                    </span>
                    <ChevronDown className={`w-3 h-3 transition-transform text-blue-600 ${showStudioDropdown ? "rotate-180" : ""}`} />
                  </Button>
                  {/* Studio Dropdown Menu */}
                  {showStudioDropdown && (
                    <div className="absolute left-0 z-50 w-56 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg top-full">
                      <div className="py-2">
                        {studios.filter(studio => studio && studio.id && studio.name).map((studio) => (
                          <button
                            key={`desktop-${studio.id}`}
                            onClick={() => {
                              setSelectedStudio(studio.id)
                              setShowStudioDropdown(false)
                            }}
                            className={`w-full px-4 py-2 text-sm text-left transition-colors hover:bg-gray-100 ${
                              selectedStudio === studio.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                            }`}
                          >
                            {studio.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Trainees with Click Dropdown */}
                <div className="relative flex items-center justify-center h-full mb-2 dropdown-container md:mb-0">
                  <Button
                    variant="ghost"
                    className="flex items-center justify-center px-4 py-2 space-x-2 h-9"
                    style={{ minWidth: "120px" }}
                    onClick={() => setShowDropdown((prev) => !prev)}
                  >
                    <User className="w-4 h-4" />
                    <span className="flex-1 text-center">Ασκούμενοι</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                  </Button>
                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute left-0 z-50 w-48 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg top-full">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setShowDropdown(false)
                            setShowMobileMenu(false)
                            router.push("/add-trainee")
                          }}
                          className="w-full px-4 py-2 text-sm text-left text-gray-700 transition-colors hover:bg-gray-100"
                        >
                          Προσθήκη Ασκούμενου
                        </button>
                        <button
                          onClick={() => {
                            setShowDropdown(false)
                            setShowMobileMenu(false)
                            router.push("/trainee-list")
                          }}
                          className="w-full px-4 py-2 text-sm text-left text-gray-700 transition-colors hover:bg-gray-100"
                        >
                          Λίστα Ασκούμενων
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  className="flex items-center mb-2 space-x-2 md:mb-0"
                  onClick={() => {
                    setShowMobileMenu(false)
                    router.push("/classes")
                  }}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Τμήματα</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center mb-2 space-x-2 md:mb-0"
                  onClick={() => setShowComingSoon(true)}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Συνδρομές</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex items-center mb-2 space-x-2 md:mb-0"
                  onClick={() => {
                    setShowMobileMenu(false)
                    router.push("/reservations")
                  }}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Κρατήσεις</span>
                </Button>
              </nav>
            {/* Mobile Modal Nav */}
            <MobileNav open={showMobileMenu} onClose={() => setShowMobileMenu(false)} />

            {/* Coming Soon Popup */}
            <AnimatePresence>
              {showComingSoon && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="flex flex-col items-center w-full max-w-xs p-8 bg-white rounded-lg shadow-lg"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  >
                    <span className="mb-2 text-lg font-bold text-center">Αυτή η λειτουργία έρχεται σύντομα!</span>
                    <Button className="mt-4" onClick={() => setShowComingSoon(false)}>
                      Κλείσιμο
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Motivational Section - Full Width */}
        <div className="mb-8">
          <MotivationalQuote />
        </div>

        {/* Business Info Chart - Responsive Grouped Bar Chart with Mobile/desktop orientation */}
        <div className="mb-12">
          <BusinessInfoChart />
        </div>

        {/* Loading during hydration */}
        {!isMounted && (
          <div className="mb-8 p-8 text-center bg-white rounded-lg border">
            <div className="animate-spin mx-auto w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-600">Φόρτωση πίνακα διαχείρισης...</p>
          </div>
        )}

        {/* Studio Selection Required Message */}
        {isMounted && !selectedStudio && (
          <div className="mb-8 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Επιλέξτε Studio για να δείτε τα δεδομένα
              </h2>
              <p className="text-gray-600 mb-4">
                Παρακαλώ επιλέξτε ένα studio από το dropdown menu στην κεφαλίδα για να δείτε τους ασκούμενους και τα στατιστικά.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setShowStudioDropdown(true)}
                className="inline-flex items-center gap-2"
              >
                <ChevronDown className="w-4 h-4" />
                Επιλογή Studio
              </Button>
            </div>
          </div>
        )}

        {/* KPI Cards - Enhanced Layout - Only show when studio is selected and mounted */}
        {isMounted && selectedStudio && (
        <div className="grid grid-cols-1 gap-16 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <Card
            className="kpi-card group"
            style={{
              border: "2.5px solid #bbb",
              boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
              transition: "box-shadow 0.3s, transform 0.3s, border-color 0.3s",
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Συνολικά Έσοδα</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€6,500</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.1%</span> από τον προηγούμενο μήνα
              </p>
            </CardContent>
          </Card>
          <Card
            className="kpi-card group"
            style={{
              border: "2.5px solid #bbb",
              boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
              transition: "box-shadow 0.3s, transform 0.3s, border-color 0.3s",
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Ενεργά Μέλη</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredData.loadingUsers ? "..." : filteredData.users.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedStudio 
                  ? `Μέλη για επιλεγμένο studio`
                  : "Συνολικά μέλη"
                }
              </p>
            </CardContent>
          </Card>
          <Card
            className="kpi-card group"
            style={{
              border: "2.5px solid #bbb",
              boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
              transition: "box-shadow 0.3s, transform 0.3s, border-color 0.3s",
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Μαθήματα Αυτόν τον Μήνα</CardTitle>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">165</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+11.5%</span> από τον προηγούμενο μήνα
              </p>
            </CardContent>
          </Card>
          <Card
            className="kpi-card group"
            style={{
              border: "2.5px solid #bbb",
              boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
              transition: "box-shadow 0.3s, transform 0.3s, border-color 0.3s",
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Μέση Συμμετοχή</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2.1%</span> από τον προηγούμενο μήνα
              </p>
            </CardContent>
          </Card>
        </div>
        )}

        <style jsx global>{`
          .kpi-card {
            background: #fff;
            border-radius: 16px;
          }
          .kpi-card:hover {
            box-shadow: 0 6px 24px 0 rgba(34,34,34,0.18);
            border-color: #222;
            transform: translateY(-4px) scale(1.025);
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: none; }
          }
          .animate-fadeIn {
            animation: fadeIn 0.2s ease;
          }
        `}</style>
      </div>
    </div>
  )
}

// Responsive hook for mobile detection (top-level, single definition)
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [breakpoint])

  return isMobile
}

// BusinessInfoChart component (top-level, single definition)
import React, { useMemo } from "react"

const BusinessInfoChart = React.memo(function BusinessInfoChart() {
  const isMobile = useIsMobile()
  const data = useMemo(
    () => [
      { month: "Ιαν", revenue: 4000, members: 80, classes: 120 },
      { month: "Φεβ", revenue: 4500, members: 90, classes: 130 },
      { month: "Μαρ", revenue: 5000, members: 100, classes: 140 },
      { month: "Απρ", revenue: 6000, members: 110, classes: 150 },
      { month: "Μαϊ", revenue: 6500, members: 112, classes: 165 },
    ],
    [],
  )

  if (isMobile) {
    // Horizontal bar chart for mobile (no hover effects, legend at the bottom left)
    return (
      <Card className="h-full" style={{ border: "2px solid #bbbbbb", boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)" }}>
        <CardHeader>
          <CardTitle>Επισκόπηση Επιχείρησης</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full" style={{ minHeight: 320 }}>
            <div className="w-full max-w-full overflow-x-auto" style={{ height: 360 }}>
              <div
                style={{
                  minWidth: 500,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <div style={{ flex: 1, height: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" barGap={8} isAnimationActive={false}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="month" type="category" />
                      <Bar dataKey="revenue" fill="#031229" radius={[0, 8, 8, 0]}>
                        <LabelList dataKey="revenue" position="right" />
                      </Bar>
                      <Bar dataKey="members" fill="#9b9b9b" radius={[0, 8, 8, 0]}>
                        <LabelList dataKey="members" position="right" />
                      </Bar>
                      <Bar dataKey="classes" fill="#646464" radius={[0, 8, 8, 0]}>
                        <LabelList dataKey="classes" position="right" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend at the bottom left */}
                <div style={{ display: "flex", justifyContent: "flex-start", gap: 24, marginTop: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 12,
                        height: 12,
                        background: "#031229",
                        borderRadius: 3,
                        border: "1.5px solid #222",
                      }}
                    ></span>
                    <span style={{ color: "#031229", fontWeight: 600 }}>Έσοδα</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 12,
                        height: 12,
                        background: "#9b9b9b",
                        borderRadius: 3,
                        border: "1.5px solid #222",
                      }}
                    ></span>
                    <span style={{ color: "#9b9b9b", fontWeight: 600 }}>Μέλη</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 12,
                        height: 12,
                        background: "#646464",
                        borderRadius: 3,
                        border: "1.5px solid #222",
                      }}
                    ></span>
                    <span style={{ color: "#646464", fontWeight: 600 }}>Μαθήματα</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Vertical bar chart for desktop (no hover effects, Greek legend)
  return (
    <Card className="h-full" style={{ border: "2px solid #bbbbbb", boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)" }}>
      <CardHeader>
        <CardTitle>Επισκόπηση Επιχείρησης</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full" style={{ minHeight: 320 }}>
          <div className="w-full max-w-full overflow-x-auto" style={{ height: 360 }}>
            <div
              style={{
                minWidth: 500,
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <div style={{ flex: 1, height: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} barGap={8} isAnimationActive={false}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Bar dataKey="revenue" fill="#031229" radius={[8, 8, 0, 0]}>
                      <LabelList dataKey="revenue" position="top" />
                    </Bar>
                    <Bar dataKey="members" fill="#9b9b9b" radius={[8, 8, 0, 0]}>
                      <LabelList dataKey="members" position="top" />
                    </Bar>
                    <Bar dataKey="classes" fill="#646464" radius={[8, 8, 0, 0]}>
                      <LabelList dataKey="classes" position="top" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Greek legend at the bottom left for desktop */}
              <div style={{ display: "flex", justifyContent: "flex-start", gap: 24, marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 12,
                      height: 12,
                      background: "#031229",
                      borderRadius: 3,
                      border: "1.5px solid #222",
                    }}
                  ></span>
                  <span style={{ color: "#031229", fontWeight: 600 }}>Έσοδα</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 12,
                      height: 12,
                      background: "#9b9b9b",
                      borderRadius: 3,
                      border: "1.5px solid #222",
                    }}
                  ></span>
                  <span style={{ color: "#9b9b9b", fontWeight: 600 }}>Μέλη</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 12,
                      height: 12,
                      background: "#646464",
                      borderRadius: 3,
                      border: "1.5px solid #222",
                    }}
                  ></span>
                  <span style={{ color: "#646464", fontWeight: 600 }}>Μαθήματα</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

// Main Admin Panel Page Component
export default function AdminPanelPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only run on client
    if (typeof window !== "undefined") {
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (isLoggedIn === "true") {
        setUser({ name: "Admin" }); // Or fetch/display actual user info if available
        setLoading(false);
      } else {
        setTimeout(() => {
          setLoading(false);
          router.replace("/login");
        }, 100);
      }
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("rememberedCredentials");
    }
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-lg">Φόρτωση...</div>
      </div>
    );
  }

  if (!user && !loading) {
    // If not loading and no user, show nothing (redirect will happen)
    return null;
  }

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between p-4 mb-4 text-white bg-black">
        <div>
          <p>Καλώς ήρθατε στον Πίνακα Διαχείρισης, {user.name} ! </p>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 text-black bg-white rounded hover:bg-gray-300">
          Αποσύνδεση
        </button>
      </div>
      <Dashboard />
    </div>
  );
}
