"use client"

import { useState, useEffect } from "react"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { ArrowLeft, Calendar, Plus, Minus, X } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { useRouter } from "next/navigation"
import axios from "axios"

// Format date as DD/MM/YYYY
function formatDate(dateString) {
  if (!dateString) return '';
  // Accepts YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  const [datePart] = dateString.split('T');
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
}

// Helper to format time as HH:MM (removes seconds if present)
function formatTime(timeStr) {
  if (!timeStr) return '-';
  // Accepts HH:mm or HH:mm:ss
  return timeStr.split(':').slice(0,2).join(':');
}

export default function ReservationsPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState("2025-07-07")
  const [reservationsData, setReservationsData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reservationClients, setReservationClients] = useState([])
  const [clientsLoading, setClientsLoading] = useState(false)

  // Fetch reservations from API using axios and token
  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/classes?date=${selectedDate}`, {
      withCredentials: true,
    })
      .then((res) => {
        let data = res.data;
        let reservations = [];
        if (Array.isArray(data)) {
          reservations = data;
        } else if (data && Array.isArray(data.classes)) {
          reservations = data.classes;
        }
        // Sort by time ascending (earliest first)
        reservations.sort((a, b) => {
          // Handles both 'time' as 'HH:mm' and missing values
          if (!a.time) return 1;
          if (!b.time) return -1;
          return a.time.localeCompare(b.time);
        });
        setReservationsData(reservations);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
        setReservationsData([]);
        setLoading(false);
      });
  }, [selectedDate])

  // Calculate statistics
  const totalReservations = reservationsData.reduce((sum, item) => sum + (item.current_participants || 0), 0)
  const totalCancellations = 12 // Mock data
  const totalClasses = reservationsData.length

  const getCapacityColor = (booked, capacity) => {
    const percentage = (booked / capacity) * 100
    if (percentage >= 80) return "text-red-600 font-semibold"
    if (percentage >= 50) return "text-yellow-600 font-semibold"
    return "text-green-600 font-semibold"
  }

  const handleReservationClick = async (reservation) => {
    setSelectedReservation(reservation)
    setClientsLoading(true)
    setIsModalOpen(true)
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings/${reservation.id}`, { withCredentials: true });
      setReservationClients(res.data);
    } catch (e) {
      setReservationClients([]);
    }
    setClientsLoading(false);
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedReservation(null)
    setReservationClients([])
  }

  return (
    <div className="min-h-screen p-2 bg-gray-50 sm:p-4">
      <div className="mx-auto max-w-7xl">
        {/* Back Button */}
        <div className="mb-4">
          <Button onClick={() => router.push("/admin-panel")} variant="outline" className="w-full text-white bg-black hover:bg-gray-900 hover:text-white sm:w-auto">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Επιστροφή στον Πίνακα Διαχείρισης
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-black rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Κρατήσεις</h1>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-4">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={dayjs(selectedDate)}
                onChange={date => {
                  if (date) setSelectedDate(date.format('YYYY-MM-DD'));
                }}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    variant: 'outlined',
                    sx: {
                      backgroundColor: '#fff',
                      borderRadius: 2,
                      border: '1px solid ',
                      color: '#111',
                      fontWeight: 500,
                      width: { xs: '100%', sm: '180px' },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: '#fff',
                        color: '#111',
                        fontWeight: 500,
                        border: 'none',
                        boxShadow: 'none',
                        '& fieldset': {
                          borderColor: '#222',
                        },
                        '&:hover fieldset': {
                          borderColor: '#000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#000',
                        },
                      },
                      '& .MuiInputBase-input': {
                        color: '#111',
                        fontWeight: 500,
                        background: '#fff',
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#111',
                      },
                    },
                    size: 'small',
                  },
                  popper: {
                    sx: {
                      '& .MuiPaper-root': {
                        background: '#fff',
                        color: '#111',
                        border: '1px solid #222',
                        borderRadius: 2,
                        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                      },
                      '& .MuiPickersDay-root': {
                        color: '#111',
                        fontWeight: 500,
                        '&.Mui-selected': {
                          background: '#111',
                          color: '#fff',
                        },
                        '&:hover': {
                          background: '#222',
                          color: '#fff',
                        },
                      },
                      '& .MuiPickersCalendarHeader-label': {
                        color: '#111',
                        fontWeight: 700,
                      },
                      '& .MuiPickersArrowSwitcher-button': {
                        color: '#111',
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 ">
          {/* Statistics Sidebar */}
          <div className="lg:col-span-1 rounded-xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ημερήσια Σύνοψη</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="text-sm font-medium text-gray-600">Ημερομηνία</div>
                  <div className="text-lg font-bold text-gray-900">{formatDate(selectedDate)}</div>
                </div>
                <div className="p-3 border border-green-200 rounded-lg bg-green-50">
                  <div className="text-sm font-medium text-green-600">Κρατήσεις</div>
                  <div className="text-lg font-bold text-green-900">{totalReservations}</div>
                </div>
                {/* <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                  <div className="text-sm font-medium text-red-600">Ακυρώσεις</div>
                  <div className="text-lg font-bold text-red-900">{totalCancellations}</div>
                </div> */}
                <div className="p-3 border border-purple-200 rounded-lg bg-purple-50">
                  <div className="text-sm font-medium text-purple-600">Σύνολο Μαθημάτων</div>
                  <div className="text-lg font-bold text-purple-900">{totalClasses}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Reservations Table */}
          <div className="lg:col-span-3 ">
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Φόρτωση...</div>
                ) : error ? (
                  <div className="p-8 text-center text-red-500">{error}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead className="border-b bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-sm font-medium text-left text-gray-900">Ώρα</th>
                          <th className="px-4 py-3 text-sm font-medium text-left text-gray-900">Μάθημα</th>
                          <th className="px-4 py-3 text-sm font-medium text-center text-gray-900">Κρατήσεις</th>
                          <th className="px-4 py-3 text-sm font-medium text-center text-gray-900">+</th>
                          <th className="px-4 py-3 text-sm font-medium text-center text-gray-900">Διαγραφή</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reservationsData.map((reservation, idx) => (
                          <tr key={reservation.id || reservation.class_id || idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{formatTime(reservation.time) || '-'}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{reservation.class_name || '-'}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center">
                                <button
                                  onClick={() => handleReservationClick(reservation)}
                                  className="flex items-center justify-center w-12 h-8 text-sm font-bold transition-colors bg-green-100 border border-green-300 rounded-lg cursor-pointer hover:bg-green-200"
                                >
                                  <span className={getCapacityColor(reservation.current_participants || 0, reservation.max_participants || 1)}>
                                    {(reservation.current_participants || 0) + '/' + (reservation.max_participants || 1)}
                                  </span>
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Button size="sm" className="w-8 h-8 p-0 bg-green-600 rounded-full hover:bg-green-700">
                                <Plus className="w-4 h-4" />
                              </Button>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Button size="sm" variant="destructive" className="px-2 text-xs">
                                Διαγραφή
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reservations Modal */}
        <ReservationsModal isOpen={isModalOpen} onClose={closeModal} reservation={selectedReservation} formatDate={formatDate} clients={reservationClients} clientsLoading={clientsLoading} />
      </div>
    </div>
  )
}

// Reservations Modal Component
function ReservationsModal({ isOpen, onClose, reservation, formatDate, clients, clientsLoading }) {
  if (!isOpen || !reservation) return null

  // Try to use reservation.date or reservation.classDate for the date, fallback to empty if not present
  let classDate = reservation.date || reservation.classDate || reservation.class_date || null;

  return (
    <>
      <style jsx global>{`
        .modal-fadein {
          animation: modalFadeIn 0.35s cubic-bezier(.4,1.4,.6,1) both;
        }
        .modal-fadeout {
          animation: modalFadeOut 0.25s cubic-bezier(.4,1.4,.6,1) both;
        }
        @keyframes modalFadeIn {
          0% { opacity: 0; transform: scale(0.96) translateY(30px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes modalFadeOut {
          0% { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0.96) translateY(30px); }
        }
        .modal-blur-bg {
          backdrop-filter: blur(8px);
          background: rgba(0,0,0,0.7) !important;
        }
        .modal-bw {
          filter: grayscale(1) contrast(1.1);
        }
      `}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center modal-blur-bg">
        <div className="w-full max-w-2xl mx-4 text-white bg-gray-900 rounded-lg shadow-2xl modal-fadein modal-bw">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold">Κρατήσεις</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {/* Class Details */}
            <div className="mb-6 space-y-2">
              <div className="space-y-1">
                <p className="text-gray-300">
                  <span className="font-medium">Μάθημα:</span> {reservation.class_name || reservation.className}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Ημερομηνία:</span> {classDate ? formatDate(classDate) : ''}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Ώρα:</span> {formatTime(reservation.time || reservation.timeFrom) || '-'}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Κρατήσεις:</span> {reservation.current_participants || reservation.booked || 0}
                </p>
              </div>
            </div>

            {/* Clients Table */}
            <div className="overflow-hidden border border-gray-700 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-sm font-medium text-left text-gray-300">Όνομα</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {clientsLoading ? (
                    <tr><td className="px-4 py-8 text-center text-gray-400">Φόρτωση...</td></tr>
                  ) : clients && clients.length > 0 ? (
                    clients.map((client, index) => (
                      <tr key={index} className="hover:bg-gray-800">
                        <td className="px-4 py-3 text-sm text-gray-200">{client.name}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-8 text-center text-gray-400">
                        Δεν υπάρχουν κρατήσεις για αυτό το μάθημα
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
