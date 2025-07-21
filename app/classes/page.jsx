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
  const [showNameErrorByDay, setShowNameErrorByDay] = useState({});
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
  // Popup for add/remove success
  const [showClassAction, setShowClassAction] = useState({ show: false, message: '', type: '' });
  // For add class form state per day
  const [showAddForm, setShowAddForm] = useState({});
  const [addFormData, setAddFormData] = useState({});
  // For max participants error per day
  const [showMaxParticipantsErrorByDay, setShowMaxParticipantsErrorByDay] = useState({});
  // For showing time error per day in add form
  const [showTimeErrorByDay, setShowTimeErrorByDay] = useState({});
  // For remove mode per day
  const [removeMode, setRemoveMode] = useState({});

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

  // Handlers for add/remove (UI only, no backend)
  const handleShowAddForm = (dayNumber) => {
    setShowAddForm((prev) => ({ ...prev, [dayNumber]: !prev[dayNumber] }));

    setAddFormData((prev) => ({ ...prev, [dayNumber]: { time: '', class_name: '' } }));
    // Hide remove mode if showing add form
    setRemoveMode((prev) => ({ ...prev, [dayNumber]: false }));
  };
  const handleToggleRemoveMode = (dayNumber) => {
    setRemoveMode((prev) => ({ ...prev, [dayNumber]: !prev[dayNumber] }));
    // Hide add form if showing remove mode
    setShowAddForm((prev) => ({ ...prev, [dayNumber]: false }));
  };
  const handleAddFormChange = (dayNumber, field, value) => {
    setAddFormData((prev) => ({
      ...prev,
      [dayNumber]: { ...prev[dayNumber], [field]: value },
    }));
  }
  const handleAddClass = async (dayNumber) => {
    // Ensure time is in HH:MM:SS format
    let time = addFormData[dayNumber]?.time || '';
    if (time && time.length === 5) {
      time = time + ':00';
    }
    const maxParticipants = Number(addFormData[dayNumber]?.max_participants);
    if (!maxParticipants || maxParticipants < 1) {
      setShowMaxParticipantsErrorByDay(prev => ({ ...prev, [dayNumber]: true }));
      return;
    } else {
      setShowMaxParticipantsErrorByDay(prev => ({ ...prev, [dayNumber]: false }));
    }
    const newClass = {
      time,
      class_name: addFormData[dayNumber]?.class_name,
      weekday: Number(dayNumber),
      max_participants: maxParticipants,
    };
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/template_classes/`,
        newClass,
        { withCredentials: true }
      );
      setTemplateClasses((prev) => [...prev, res.data]);
      setShowAddForm((prev) => ({ ...prev, [dayNumber]: false }));
      setShowClassAction({ show: true, message: 'Το τμήμα προστέθηκε επιτυχώς', type: 'add' });
      setTimeout(() => setShowClassAction({ show: false, message: '', type: '' }), 2000);
    } catch (err) {
      let msg = 'Σφάλμα κατά την προσθήκη';
      if (err.response && err.response.data && err.response.data.detail) {
        msg += `: ${err.response.data.detail}`;
      } else if (err.message) {
        msg += `: ${err.message}`;
      }
      setShowClassAction({ show: true, message: msg, type: 'remove' });
      setTimeout(() => setShowClassAction({ show: false, message: '', type: '' }), 4000);
      // Also log for developer
      console.error('Add class error:', err);
    }
  };
  const handleRemoveClass = async (dayNumber, index) => {
    const dayTmpls = groupedTemplateClasses[dayNumber].templates;
    const tmplToRemove = dayTmpls[index];
    if (!tmplToRemove.id) {
      setShowClassAction({ show: true, message: 'Δεν βρέθηκε το ID του τμήματος', type: 'remove' });
      setTimeout(() => setShowClassAction({ show: false, message: '', type: '' }), 2000);
      return;
    }
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/template_classes/${tmplToRemove.id}`,
        { withCredentials: true }
      );
      setTemplateClasses((prev) => prev.filter((t) => t.id !== tmplToRemove.id));
      setShowClassAction({ show: true, message: 'Το τμήμα αφαιρέθηκε επιτυχώς', type: 'remove' });
      setTimeout(() => setShowClassAction({ show: false, message: '', type: '' }), 2000);
    } catch (err) {
      setShowClassAction({ show: true, message: 'Σφάλμα κατά την αφαίρεση', type: 'remove' });
      setTimeout(() => setShowClassAction({ show: false, message: '', type: '' }), 2000);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white to-gray-200">
      {/* Back Button - Top Corner */}
      <div className="absolute z-50 top-4 left-4">
        <Button onClick={() => router.push("/admin-panel")} variant="outline" className="text-white bg-black hover:bg-gray-900 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Επιστροφή στον Πίνακα Διαχείρισης
        </Button>
      </div>

      <div className="flex flex-col items-center w-full max-w-4xl px-2 py-4 mx-auto sm:p-6">
        {/* Title */}
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-center text-black drop-shadow-sm">
          Τμήματα
        </h1>
        
        {/* Main Container */}
        <div className="flex flex-col items-center w-full p-2 sm:p-8 bg-white border shadow-2xl rounded-2xl shadow-black max-w-[98vw]">
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
            <div className="bg-gray-200 rounded-xl border border-gray-200 p-2 sm:p-8 w-full max-w-[98vw] sm:max-w-md shadow-[0_4px_24px_0_rgba(0,0,0,0.18),0_1.5px_6px_0_rgba(0,0,0,0.12)] mb-8 max-h-[60vh] overflow-y-auto">
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
                                <div key={index} className="flex items-center gap-2 px-3 py-1 text-black bg-gray-200 rounded-md">
                                  <span>{tmpl.time ? `${timeStr} - ` : ''}{tmpl.class_name || '-'}</span>
                                  {removeMode[dayNumber] && (
                                    <button
                                      className="ml-2  px-2 py-0.5 text-xs bg-red-500 text-white rounded-xl hover:bg-red-700"
                                      onClick={() => handleRemoveClass(dayNumber, index)}
                                      title="Αφαίρεση τμήματος"
                                    >
                                      -
                                    </button>
                                  )}
                                </div>
                              );
                            })
                        ) : (
                          <div className="italic text-gray-400">Δεν υπάρχουν προγραμματισμένα τμήματα</div>
                        )}
                      </div>
                      {/* Add/Remove Class Buttons & Inline Form */}
                      <div className="flex gap-2 mt-3">
                        {showAddForm[dayNumber] ? (
                          <div className="flex flex-col items-center w-full gap-3 p-3 border border-gray-300 rounded-md bg-gray-50">
                            {/* Time input at the top */}
                            <label className="w-full mb-1 text-xs font-semibold text-center text-gray-700">Ώρα</label>
                              <input
                                type="time"
                                value={addFormData[dayNumber]?.time || ''}
                                onChange={e => {
                                  handleAddFormChange(dayNumber, 'time', e.target.value);
                                  if (showTimeErrorByDay?.[dayNumber] && e.target.value) {
                                    setShowTimeErrorByDay(prev => ({ ...prev, [dayNumber]: false }));
                                  }
                                }}
                                className="w-2/3 px-2 py-2 mx-auto text-lg text-center border rounded focus:ring-2 focus:ring-black"
                              />
                              {/* Error message if time is missing and user tried to submit */}
                              {showTimeErrorByDay?.[dayNumber] && (
                                <div className="w-full mt-1 text-xs text-center text-red-600">Παρακαλώ προσθέστε ώρα.</div>
                              )}
                        {/* Class name input at the bottom */}
                        <label className="w-full mt-2 mb-1 text-xs font-semibold text-center text-gray-700">Όνομα τμήματος</label>
                        <input
                          type="text"
                          placeholder="Όνομα τμήματος"
                          value={addFormData[dayNumber]?.class_name || ''}
                          onChange={e => {
                            handleAddFormChange(dayNumber, 'class_name', e.target.value);
                            if (showNameErrorByDay?.[dayNumber] && e.target.value) {
                              setShowNameErrorByDay(prev => ({ ...prev, [dayNumber]: false }));
                            }
                          }}
                          className="w-2/3 px-2 py-2 mx-auto text-lg border rounded focus:ring-2 focus:ring-black"
                        />
                        {/* Error message if class name is missing and user tried to submit */}
                        {showNameErrorByDay?.[dayNumber] && (
                          <div className="w-full mt-1 text-xs text-center text-red-600">Παρακαλώ προσθέστε όνομα τμήματος.</div>
                        )}
                        {/* Max participants input */}
                        <label className="w-full mt-2 mb-1 text-xs font-semibold text-center text-gray-700">Μέγιστος αριθμός συμμετεχόντων</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="20"
                          value={addFormData[dayNumber]?.max_participants || ''}
                          onChange={e => {
                            handleAddFormChange(dayNumber, 'max_participants', e.target.value);
                            if (showMaxParticipantsErrorByDay?.[dayNumber] && e.target.value && Number(e.target.value) > 0) {
                              setShowMaxParticipantsErrorByDay(prev => ({ ...prev, [dayNumber]: false }));
                            }
                          }}
                          className="w-2/3 px-2 py-2 mx-auto text-lg border rounded focus:ring-2 focus:ring-black"
                        />
                        {/* Error message if max participants is missing or invalid */}
                        {showMaxParticipantsErrorByDay?.[dayNumber] && (
                          <div className="w-full mt-1 text-xs text-center text-red-600">Παρακαλώ προσθέστε έγκυρο αριθμό συμμετεχόντων.</div>
                        )}
                        <div className="flex justify-center w-full gap-2 mt-4">
                          <button
                            className="px-4 py-2 text-xs font-bold text-white bg-green-600 rounded hover:bg-green-800"
                            onClick={() => {
                              let hasError = false;
                              if (!addFormData[dayNumber]?.time) {
                                setShowTimeErrorByDay(prev => ({ ...prev, [dayNumber]: true }));
                                hasError = true;
                              } else {
                                setShowTimeErrorByDay(prev => ({ ...prev, [dayNumber]: false }));
                              }
                              if (!addFormData[dayNumber]?.class_name) {
                                setShowNameErrorByDay(prev => ({ ...prev, [dayNumber]: true }));
                                hasError = true;
                              } else {
                                setShowNameErrorByDay(prev => ({ ...prev, [dayNumber]: false }));
                              }
                              if (!addFormData[dayNumber]?.max_participants || Number(addFormData[dayNumber]?.max_participants) < 1) {
                                setShowMaxParticipantsErrorByDay(prev => ({ ...prev, [dayNumber]: true }));
                                hasError = true;
                              } else {
                                setShowMaxParticipantsErrorByDay(prev => ({ ...prev, [dayNumber]: false }));
                              }
                              if (hasError) return;
                              handleAddClass(dayNumber);
                            }}
                          >
                            Προσθήκη
                          </button>
                          <button
                            className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-200 border border-gray-400 rounded hover:bg-gray-300"
                            onClick={() => handleShowAddForm(dayNumber)}
                          >
                            Ακύρωση
                          </button>
                        </div>
                          </div>
                        ) : (
                          <>
                            <button
                              className="px-4 py-1 mt-2 text-xs font-bold text-white bg-green-600 rounded hover:bg-green-800"
                              onClick={() => handleShowAddForm(dayNumber)}
                            >
                              + Προσθήκη τμήματος
                            </button>
                            <button
                              className={`mt-2 px-4 py-1 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-800 ${removeMode[dayNumber] ? 'ring-2 ring-red-400' : ''}`}
                              onClick={() => handleToggleRemoveMode(dayNumber)}
                            >
                              {removeMode[dayNumber] ? 'Τέλος αφαίρεσης' : 'Αφαίρεση τμήματος'}
                            </button>
                          </>
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
                  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/generate_schedule?start_date=${startStr}&end_date=${endStr}`, {
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
              <div className="fixed top-6 right-6 z-[60] flex flex-col items-end gap-2 pointer-events-none">
                <div className={`relative z-10 flex flex-row items-center min-w-[260px] max-w-xs px-6 py-4 rounded-xl shadow-lg animate-toastslide border-2 ${showSuccess ? 'bg-green-600 border-green-700 text-white' : 'bg-red-600 border-red-700 text-white'}`}
                  style={{ pointerEvents: 'auto' }}>
                  <svg className="mr-3 text-white" width="28" height="28" fill="none" viewBox="0 0 24 24">
                    {showSuccess ? (
                      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    ) : (
                      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                  <div className="text-base font-semibold drop-shadow-sm">
                    {showSuccess ? 'Το πρόγραμμα δημιουργήθηκε' : showError}
                  </div>
                </div>
                <style jsx global>{`
                  @keyframes toastslide {
                    0% { opacity: 0; transform: translateX(60px) scale(0.96); }
                    100% { opacity: 1; transform: translateX(0) scale(1); }
                  }
                  .animate-toastslide {
                    animation: toastslide 0.32s cubic-bezier(.4,1.4,.6,1) both;
                  }
                  .animate-bounce {
                    animation: bounce 0.8s infinite alternate;
                  }
                  @keyframes bounce {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-8px); }
                  }
                `}</style>
              </div>
            )}
            {showClassAction.show && (
              <div className="fixed top-6 right-6 z-[70] flex flex-col items-end gap-2 pointer-events-none">
                <div className={`relative z-10 flex flex-row items-center min-w-[220px] max-w-xs px-5 py-3 rounded-xl shadow-lg animate-toastslide border-2 ${showClassAction.type === 'add' ? 'bg-green-500 border-green-700 text-white' : 'bg-red-500 border-red-700 text-white'}`}
                  style={{ pointerEvents: 'auto' }}>
                  <svg className="mr-3 text-white" width="22" height="22" fill="none" viewBox="0 0 24 24">
                    {showClassAction.type === 'add' ? (
                      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    ) : (
                      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                  <div className="text-base font-semibold drop-shadow-sm">
                    {showClassAction.message}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
