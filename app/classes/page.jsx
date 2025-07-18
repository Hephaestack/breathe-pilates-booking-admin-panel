"use client"


import { useState, useEffect } from "react"
import { Calendar, ChevronDown, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "../components/ui/button"
import axios from "axios"
import DatePicker, { registerLocale } from "react-datepicker"
import { el } from "date-fns/locale"
import "react-datepicker/dist/react-datepicker.css"

registerLocale("el", el)

export default function TimetablePage() {
  const router = useRouter()
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
  })
  const [showCalendar, setShowCalendar] = useState(false)
  const [templateClasses, setTemplateClasses] = useState([])
  // Remove classes state, only use templateClasses
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('el-GR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
  }



  // Fetch only template classes from API
  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/template_classes`, { withCredentials: true })
      .then((templateRes) => {
        let templates = [];
        const tData = templateRes.data;
        if (Array.isArray(tData)) {
          templates = tData;
        } else if (tData && Array.isArray(tData.template_classes)) {
          templates = tData.template_classes;
        }
        setTemplateClasses(templates);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Σφάλμα κατά τη φόρτωση τμημάτων:', err);
        setTemplateClasses([]);
        setError('Σφάλμα κατά τη φόρτωση τμημάτων');
        setLoading(false);
      });
  }, []);

  // Group classes by day of week
  // Group template classes by weekday
  const groupTemplatesByDay = (templates) => {
    const days = {
      0: { name: 'Δευτέρα', templates: [] },
      1: { name: 'Τρίτη', templates: [] },
      2: { name: 'Τετάρτη', templates: [] },
      3: { name: 'Πέμπτη', templates: [] },
      4: { name: 'Παρασκευή', templates: [] },
      5: { name: 'Σάββατο', templates: [] },
    };
    (templates || []).forEach(tmpl => {
      if (tmpl && days.hasOwnProperty(tmpl.weekday)) {
        days[tmpl.weekday].templates.push(tmpl);
      }
    });
    return days;
  }

  const groupedTemplateClasses = groupTemplatesByDay(templateClasses)

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white to-gray-200">
      {/* Back Button - Top Corner */}
      <div className="absolute z-50 top-4 left-4">
        <Button onClick={() => router.push("/admin-panel")} variant="outline" className="text-white bg-black hover:bg-gray-900 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Επιστροφή στον Πίνακα Διαχείρισης
        </Button>
      </div>

      <div className="flex flex-col items-center max-w-4xl p-6 mx-auto">
        {/* Title */}
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-center text-black drop-shadow-sm">
          Τμήματα
        </h1>
        
        {/* Main Container */}
        <div className="flex flex-col items-center w-full p-8 bg-white border shadow-2xl rounded-2xl shadow-black">
          {/* Date Range Picker */}
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
                <>
                  {/* Modal Overlay - full black */}
                  <div className="fixed inset-0 z-40 backdrop-blur-[6px] transition-opacity duration-300" onClick={() => setShowCalendar(false)} />
                  {/* Modal Centered with animation */}
                  <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="bg-white border-black border-[2.5px] rounded-lg shadow-2xl p-6 min-w-[340px] max-w-md w-full relative transition-all duration-300 transform animate-fadeinscale flex flex-col items-center justify-center mx-auto">

<style jsx global>{`
@keyframes fadeinscale {
  0% { opacity: 0; transform: scale(0.92) translateY(30px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-fadeinscale {
  animation: fadeinscale 0.32s cubic-bezier(.4,1.4,.6,1) both;
}
`}</style>
                    <div className="flex flex-col items-center justify-center w-full gap-2 mb-4">
                      <div className="flex flex-row items-center justify-center w-full gap-2">
                        <div className="flex flex-col items-center w-1/2">
                          <label className="block mb-2 text-sm font-medium text-center text-gray-700">Από</label>
                          <div className="relative flex flex-col items-center w-full">
                            <DatePicker
                              selected={dateRange.startDate}
                              onChange={date => setDateRange(prev => ({ ...prev, startDate: date }))}
                              dateFormat="dd/MM/yyyy"
                              locale="el"
                              className="w-full px-3 py-2 text-lg font-bold tracking-wide text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                              calendarStartDay={1}
                              placeholderText="Ημερομηνία έναρξης"
                              customInput={
                                <button
                                  type="button"
                                  className="w-full px-6 py-4 text-2xl font-extrabold tracking-wide text-center bg-white border border-gray-300 cursor-pointer rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                                  tabIndex={0}
                                >
                                  {dateRange.startDate
                                    ? dateRange.startDate.toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                    : ''}
                                </button>
                              }
                            />
                            <div className="w-full mt-1 font-mono text-xs text-center text-gray-700">
                              {dateRange.startDate &&
                                dateRange.startDate.toLocaleDateString('el-GR', {
                                  weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
                                })}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-center w-1/2">
                          <label className="block mb-2 text-sm font-medium text-center text-gray-700">Μέχρι</label>
                          <div className="relative flex flex-col items-center w-full">
                            <DatePicker
                              selected={dateRange.endDate}
                              onChange={date => setDateRange(prev => ({ ...prev, endDate: date }))}
                              minDate={dateRange.startDate}
                              dateFormat="dd/MM/yyyy"
                              locale="el"
                              className="w-full px-3 py-2 text-lg font-bold tracking-wide text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                              calendarStartDay={1}
                              placeholderText="Ημερομηνία λήξης"
                              customInput={
                                <button
                                  type="button"
                                  className="w-full px-6 py-4 text-2xl font-extrabold tracking-wide text-center bg-white border border-gray-300 cursor-pointer rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                                  tabIndex={0}
                                >
                                  {dateRange.endDate
                                    ? dateRange.endDate.toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                    : ''}
                                </button>
                              }
                            />
                            <div className="w-full mt-1 font-mono text-xs text-center text-gray-700">
                              {dateRange.endDate &&
                                dateRange.endDate.toLocaleDateString('el-GR', {
                                  weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
                                })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                      {/* Quick Select Options */}
                      <div className="flex flex-col items-center justify-center w-full mb-4">
                        <p className="w-full mb-2 text-sm font-medium text-center text-gray-700">Γρήγορη επιλογή:</p>
                        <div className="flex flex-row flex-wrap items-center justify-center w-full gap-2">
                          <button
                            onClick={() => {
                              const today = new Date()
                              setDateRange({ startDate: today, endDate: today })
                            }}
                            className="px-3 py-1 text-xs transition-colors bg-gray-100 rounded-md hover:bg-gray-200"
                          >
                            Σήμερα
                          </button>
                          <button
                            onClick={() => {
                              const today = new Date()
                              const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
                              setDateRange({ startDate: today, endDate: nextWeek })
                            }}
                            className="px-3 py-1 text-xs transition-colors bg-gray-100 rounded-md hover:bg-gray-200"
                          >
                            Επόμενη εβδομάδα
                          </button>
                          <button
                            onClick={() => {
                              const today = new Date()
                              const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate())
                              setDateRange({ startDate: today, endDate: nextMonth })
                            }}
                            className="px-3 py-1 text-xs transition-colors bg-gray-100 rounded-md hover:bg-gray-200"
                          >
                            Επόμενος μήνας
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowCalendar(false)}
                          className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-800"
                        >
                          Ακύρωση
                        </button>
                        <button
                          onClick={() => setShowCalendar(false)}
                          className="px-4 py-2 text-white transition-colors bg-black rounded-md hover:bg-gray-900"
                        >
                          Επιλογή
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Πρόγραμμα Προτύπων Τμημάτων */}
          <div className="flex flex-col items-center w-full">
            <div className="bg-gray-200 rounded-xl border border-gray-200 p-8 min-w-[340px] max-w-md w-full shadow-inner mb-8 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-600">Φόρτωση τμημάτων...</div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-red-600">Σφάλμα: {error}</div>
                </div>
              ) : (
                <div className="space-y-10">
                  {Object.entries(groupedTemplateClasses).map(([dayNumber, dayData]) => (
                    <div key={dayNumber} className="p-4 bg-white border-l-4 border-black rounded-lg shadow-sm">
                      <h3 className="mb-2 font-semibold text-black">{dayData.name}</h3>
                      <div className="ml-2 space-y-1 text-sm text-black">
                        {dayData.templates.length > 0 ? (
                          dayData.templates
                            .sort((a, b) => {
                              if (!a.time && !b.time) return 0;
                              if (!a.time) return 1;
                              if (!b.time) return -1;
                              return a.time.localeCompare(b.time);
                            })
                            .map((tmpl, index) => {
                              let timeStr = '';
                              if (tmpl.time) {
                                const [h, m] = tmpl.time.split(":");
                                timeStr = `${h}:${m}`;
                              }
                              return (
                                <div key={index} className="px-3 py-1 text-black bg-gray-200 rounded-md">
                                  {tmpl.time ? `${timeStr} - ` : ''}{tmpl.class_name || '-'}
                                </div>
                              );
                            })
                        ) : (
                          <div className="italic text-gray-400">Δεν υπάρχουν προγραμματισμένα τμήματα</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Add to Schedule Button Centered Below */}
            <button
              className={`px-8 py-4 mt-2 text-lg font-bold text-white transition-all duration-200 transform bg-black shadow-lg rounded-xl hover:bg-gray-900 hover:text-white hover:shadow-xl hover:scale-105 ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={async () => {
                // Format dates as YYYY-MM-DD
                const start = dateRange.startDate;
                const end = dateRange.endDate;
                const startStr = `${start.getFullYear()}-${(start.getMonth()+1).toString().padStart(2,'0')}-${start.getDate().toString().padStart(2,'0')}`;
                const endStr = `${end.getFullYear()}-${(end.getMonth()+1).toString().padStart(2,'0')}-${end.getDate().toString().padStart(2,'0')}`;
                setIsSubmitting(true);
                try {
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/generater-schedule?start_date=${startStr}&end_date=${endStr}`, {
                    method: 'POST',
                    credentials: 'include',
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 2500);
                  } else {
                    setShowError(data.detail || 'Σφάλμα κατά τη δημιουργία προγράμματος');
                    setTimeout(() => setShowError(""), 2500);
                  }
                } catch (e) {
                  setShowError('Σφάλμα σύνδεσης με τον server');
                  setTimeout(() => setShowError(""), 2500);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Παρακαλώ περιμένετε...
                </span>
              ) : (
                'Βάλε στο πρόγραμμα'
              )}
            </button>
            {(showSuccess || showError) && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center">
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[4px] transition-opacity duration-300"></div>
                <div className={`relative z-10 flex flex-col items-center justify-center min-w-[320px] max-w-xs w-full px-8 py-7 rounded-3xl shadow-2xl animate-fadeinscale border-2 ${showSuccess ? 'bg-gradient-to-br from-green-500 to-green-700 border-green-700 text-white' : 'bg-gradient-to-br from-red-500 to-red-700 border-red-700 text-white'}`}>
                  <svg className={`mx-auto mb-2 ${showSuccess ? 'text-white' : 'text-white'} ${showSuccess ? 'animate-bounce' : ''}`} width="36" height="36" fill="none" viewBox="0 0 24 24">
                    {showSuccess ? (
                      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    ) : (
                      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                  <div className="text-xl font-extrabold text-center drop-shadow-sm">
                    {showSuccess ? 'Το πρόγραμμα δημιουργήθηκε' : showError}
                  </div>
                </div>
                <style jsx global>{`
                  @keyframes fadeinscale {
                    0% { opacity: 0; transform: scale(0.92) translateY(30px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                  }
                  .animate-fadeinscale {
                    animation: fadeinscale 0.32s cubic-bezier(.4,1.4,.6,1) both;
                  }
                  .animate-bounce {
                    animation: bounce 0.8s infinite alternate;
                  }
                  @keyframes bounce {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-10px); }
                  }
                `}</style>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
