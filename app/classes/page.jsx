"use client"

import { useState, useEffect } from "react"
import { Calendar, ChevronDown } from "lucide-react"

export default function TimetablePage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
  })
  const [showCalendar, setShowCalendar] = useState(false)
  const [templateClasses, setTemplateClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('el-GR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
  }

  // Fetch template classes from API
  useEffect(() => {
    const fetchTemplateClasses = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://breathe-pilates-booking-api-dev.onrender.com/admin/template_classes', {
          method: 'GET',
          credentials: 'include', // This sends the authentication cookie
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) {
          throw new Error('Failed to fetch template classes')
        }
        const data = await response.json()
        setTemplateClasses(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTemplateClasses()
  }, [])

  // Group classes by day of week
  const groupClassesByDay = (classes) => {
    const days = {
      1: { name: 'Δευτέρα', classes: [] },
      2: { name: 'Τρίτη', classes: [] },
      3: { name: 'Τετάρτη', classes: [] },
      4: { name: 'Πέμπτη', classes: [] },
      5: { name: 'Παρασκευή', classes: [] },
      6: { name: 'Σάββατο', classes: [] },
      0: { name: 'Κυριακή', classes: [] }
    }

    classes.forEach(classItem => {
      if (days[classItem.day_of_week]) {
        days[classItem.day_of_week].classes.push(classItem)
      }
    })

    return days
  }

  const groupedClasses = groupClassesByDay(templateClasses)

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-200  p-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Title */}
        <h1 className="text-3xl font-extrabold text-black mb-8 text-center tracking-tight drop-shadow-sm">
          Τμήματα
        </h1>

        {/* Main Container */}
        <div className="bg-white rounded-2xl shadow-2xl border shadow-black p-8 w-full flex flex-col items-center">          {/* Date Range Picker */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="bg-white border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg min-w-[280px] text-center cursor-pointer shadow-sm hover:border-gray-400 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {/* Custom Calendar Dropdown */}
              {showCalendar && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-xl z-50 p-4 min-w-[320px]">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Από</label>
                      <input
                        type="date"
                        value={dateRange.startDate.toISOString().split('T')[0]}
                        onChange={(e) => setDateRange(prev => ({ 
                          ...prev, 
                          startDate: new Date(e.target.value) 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Μέχρι</label>
                      <input
                        type="date"
                        value={dateRange.endDate.toISOString().split('T')[0]}
                        onChange={(e) => setDateRange(prev => ({ 
                          ...prev, 
                          endDate: new Date(e.target.value) 
                        }))}
                        min={dateRange.startDate.toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                      />
                    </div>
                  </div>
                  
                  {/* Quick Select Options */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Γρήγορη επιλογή:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          const today = new Date()
                          setDateRange({ startDate: today, endDate: today })
                        }}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        Σήμερα
                      </button>
                      <button
                        onClick={() => {
                          const today = new Date()
                          const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                          setDateRange({ startDate: today, endDate: nextWeek })
                        }}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        Επόμενη εβδομάδα
                      </button>
                      <button
                        onClick={() => {
                          const today = new Date()
                          const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
                          setDateRange({ startDate: today, endDate: nextMonth })
                        }}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        Επόμενος μήνας
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowCalendar(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Ακύρωση
                    </button>
                    <button
                      onClick={() => setShowCalendar(false)}
                      className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900 transition-colors"
                    >
                      Επιλογή
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Template Classes Centered */}
          <div className="flex flex-col items-center w-full">
            <div className="bg-gray-200 rounded-xl border border-gray-200 p-8 min-w-[340px] max-w-md w-full shadow-inner mb-8 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-gray-600">Φόρτωση τμημάτων...</div>
                </div>
              ) : error ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-red-600">Σφάλμα: {error}</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedClasses).map(([dayNumber, dayData]) => (
                    <div key={dayNumber} className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-black">
                      <h3 className="font-semibold text-black mb-2">{dayData.name}</h3>
                      <div className="text-sm text-black ml-2 space-y-1">
                        {dayData.classes.length > 0 ? (
                          dayData.classes
                            .sort((a, b) => a.start_time.localeCompare(b.start_time))
                            .map((classItem, index) => (
                              <div key={index} className="bg-gray-50 px-3 py-1 rounded-md text-black">
                                {classItem.start_time} - {classItem.name}
                              </div>
                            ))
                        ) : (
                          <div className="text-gray-500 italic">Δεν υπάρχουν τμήματα</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Add to Schedule Button Centered Below */}
            <button className="px-8 py-4 bg-black  text-white rounded-xl shadow-lg hover:bg-gray-900 hover:text-white hover:shadow-xl transform hover:scale-105 transition-all duration-200 font-bold text-lg mt-2">
              Βάλε στο πρόγραμμα
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
