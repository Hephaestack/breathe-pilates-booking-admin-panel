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
  // Set default date to today in YYYY-MM-DD
  const getToday = () => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };
  const [selectedDate, setSelectedDate] = useState(getToday())
  const [reservationsData, setReservationsData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reservationClients, setReservationClients] = useState([])
  const [clientsLoading, setClientsLoading] = useState(false)
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [selectedClassForAddUser, setSelectedClassForAddUser] = useState(null)
  const [newUserName, setNewUserName] = useState("")
  // Delete user modal state (now managed inside ReservationsModal)
  // Remove these from here, will be managed in ReservationsModal
  const [toasts, setToasts] = useState([])

  // Add toast function
  const addToast = (message, type = 'success') => {
    const id = Date.now()
    const toast = { id, message, type }
    setToasts(prev => [...prev, toast])
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  // Remove toast function
  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

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

  const handleAddUserClick = (reservation) => {
    setSelectedClassForAddUser(reservation)
    setIsAddUserModalOpen(true)
  }

  const closeAddUserModal = () => {
    setIsAddUserModalOpen(false)
    setSelectedClassForAddUser(null)
    setNewUserName("")
  }

  const handleAddUser = async () => {
    if (!newUserName.trim()) return
    
    try {
      // Make API call to add user to class
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/post-booking`, {
        class_id: selectedClassForAddUser.id,
        trainee_name: newUserName.trim()
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      })
      
      addToast(`Ο χρήστης "${newUserName}" προστέθηκε στο μάθημα επιτυχώς!`, 'success')
      closeAddUserModal()
      
      // Refresh reservations data
      const refreshRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/classes?date=${selectedDate}`, {
        withCredentials: true,
      })
      let data = refreshRes.data;
      let reservations = [];
      if (Array.isArray(data)) {
        reservations = data;
      } else if (data && typeof data === 'object' && data.reservations && Array.isArray(data.reservations)) {
        reservations = data.reservations;
      } else if (data && typeof data === 'object' && data.classes && Array.isArray(data.classes)) {
        reservations = data.classes;
      }
      reservations.sort((a, b) => {
        const timeA = a.time || a.timeFrom || '';
        const timeB = b.time || b.timeFrom || '';
        return timeA.localeCompare(timeB);
      });
      setReservationsData(reservations);
      
    } catch (error) {
      console.error("Error adding user to class:", error);
      addToast("Σφάλμα κατά την προσθήκη χρήστη στο μάθημα: " + (error.response?.data?.detail || error.message), 'error')
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    if (!userId || !selectedClassForDelete) return
    
    try {
      // Delete user using the correct endpoint from API documentation
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
        withCredentials: true
      })
      
      addToast("Ο χρήστης αφαιρέθηκε από το μάθημα επιτυχώς!", 'success')
      
      // Refresh the delete modal clients list
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings/${selectedClassForDelete.id}`, { 
        withCredentials: true 
      });
      setDeleteModalClients(res.data);
      
      // Refresh reservations data
      const refreshRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/classes?date=${selectedDate}`, {
        withCredentials: true,
      })
      let data = refreshRes.data;
      let reservations = [];
      if (Array.isArray(data)) {
        reservations = data;
      } else if (data && Array.isArray(data.classes)) {
        reservations = data.classes;
      }
      reservations.sort((a, b) => {
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      });
      setReservationsData(reservations);
      
    } catch (error) {
      addToast("Σφάλμα κατά την αφαίρεση χρήστη από το μάθημα: " + (error.response?.data?.detail || error.message), 'error')
    }
  }


  // Custom popup state for class delete
  const [deleteClassPopup, setDeleteClassPopup] = useState({ open: false, type: '', message: '' });
  // Custom confirmation popup state for class delete
  const [confirmDeletePopup, setConfirmDeletePopup] = useState({ open: false, reservation: null });

  // Show confirmation popup before delete
  const handleDeleteClass = (reservation) => {
    setConfirmDeletePopup({ open: true, reservation });
  };

  // Confirm delete action
  const confirmDeleteClass = async () => {
    const reservation = confirmDeletePopup.reservation;
    setConfirmDeletePopup({ open: false, reservation: null });
    if (!reservation) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/classes/${reservation.id || reservation.class_id}`,
        { withCredentials: true });
      setReservationsData(prev => prev.filter(r => (r.id || r.class_id) !== (reservation.id || reservation.class_id)));
      setDeleteClassPopup({ open: true, type: 'success', message: 'Το μάθημα διαγράφηκε επιτυχώς.' });
      setTimeout(() => setDeleteClassPopup({ open: false, type: '', message: '' }), 2000);
    } catch (err) {
      setDeleteClassPopup({ open: true, type: 'error', message: err.response?.data?.detail || 'Σφάλμα κατά τη διαγραφή του μαθήματος.' });
      setTimeout(() => setDeleteClassPopup({ open: false, type: '', message: '' }), 2000);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setSelectedClassForDelete(null)
    setDeleteModalClients([])
  }

  return (
    <div className="min-h-screen p-2 bg-gray-50 sm:p-4">
      <div className="mx-auto max-w-7xl">
        {/* Custom Delete Class Confirmation Popup */}
        {confirmDeletePopup.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{backdropFilter:'blur(6px)', background:'rgba(0,0,0,0.18)'}}>
            <div className="px-8 py-7 rounded-2xl shadow-2xl border-2 bg-white border-gray-400 flex flex-col items-center min-w-[300px] max-w-[90vw]" style={{ minHeight: 140, animation: 'deletePopupAnim 0.45s cubic-bezier(0.4,0,0.2,1)' }}>
              <svg className="w-10 h-10 mb-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              <div className="mb-2 text-lg font-semibold text-center text-gray-900">
                Θέλετε σίγουρα να διαγράψετε αυτό το μάθημα;
              </div>
              <div className="flex gap-4 mt-3">
                <button
                  className="px-6 py-2 font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                  onClick={confirmDeleteClass}
                >
                  Διαγραφή
                </button>
                <button
                  className="px-6 py-2 font-medium text-gray-900 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                  onClick={() => setConfirmDeletePopup({ open: false, reservation: null })}
                >
                  Ακύρωση
                </button>
              </div>
              <style jsx global>{`
                @keyframes deletePopupAnim {
                  0% { opacity: 0; transform: translateY(30px) scale(0.95); }
                  60% { opacity: 1; transform: translateY(-8px) scale(1.03); }
                  100% { opacity: 1; transform: translateY(0) scale(1); }
                }
              `}</style>
            </div>
          </div>
        )}

        {/* Custom Delete Class Popup */}
        {deleteClassPopup.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{backdropFilter:'blur(6px)', background:'rgba(0,0,0,0.18)'}}>
            <div className={`px-8 py-6 rounded-2xl shadow-2xl border-2 flex flex-col items-center min-w-[280px] max-w-[90vw] ${deleteClassPopup.type === 'success' ? 'bg-green-500 border-green-700' : 'bg-red-500 border-red-700'}`}
                 style={{ minHeight: 120, animation: 'deletePopupAnim 0.45s cubic-bezier(0.4,0,0.2,1)' }}
                 onClick={() => setDeleteClassPopup({ open: false, type: '', message: '' })}
            >
              {deleteClassPopup.type === 'success' ? (
                <svg className="w-10 h-10 mb-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-10 h-10 mb-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
              <div className="mb-1 text-lg font-semibold text-center text-white">
                {deleteClassPopup.message}
              </div>
              <div className="mt-2 text-xs text-white/80">Κάντε κλικ για να κλείσετε</div>
              <style jsx global>{`
                @keyframes deletePopupAnim {
                  0% { opacity: 0; transform: translateY(30px) scale(0.95); }
                  60% { opacity: 1; transform: translateY(-8px) scale(1.03); }
                  100% { opacity: 1; transform: translateY(0) scale(1); }
                }
              `}</style>
            </div>
          </div>
        )}
        {/* Back Button */}
        <div className="mb-4">
          <Button onClick={() => router.push("/admin-panel")} variant="outline" className="w-full text-white bg-black hover:bg-gray-900 hover:text-white sm:w-auto">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Επιστροφή στον Πίνακα Διαχείρισης
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-center space-x-3 sm:justify-start lg:justify-start">
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
            <div className="justify-center lg:col-span-1 rounded-xl lg:justify-start">
            <Card className="border-2 border-gray-300">
              <CardHeader className="flex flex-col items-center justify-center">
                <CardTitle className="text-lg text-center">Ημερήσια Σύνοψη</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 text-center border border-gray-400 rounded-lg bg-gray-50">
                  <div className="text-sm font-medium text-gray-600">Ημερομηνία</div>
                  <div className="text-lg font-bold text-gray-900">{formatDate(selectedDate)}</div>
                </div>
                <div className="p-3 text-center border border-green-500 rounded-lg bg-green-50">
                  <div className="text-sm font-medium text-green-600">Κρατήσεις</div>
                  <div className="text-lg font-bold text-green-900">{totalReservations}</div>
                </div>
                {/* <div className="p-3 text-center border border-red-400 rounded-lg bg-red-50">
                  <div className="text-sm font-medium text-red-600">Ακυρώσεις</div>
                  <div className="text-lg font-bold text-red-900">{totalCancellations}</div>
                </div> */}
                <div className="p-3 text-center border border-purple-500 rounded-lg bg-purple-50">
                  <div className="text-sm font-medium text-purple-600">Σύνολο Μαθημάτων</div>
                  <div className="text-lg font-bold text-purple-900">{totalClasses}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Reservations Table */}
          <div className="lg:col-span-3 ">
            <Card className="border-2 border-gray-400">
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Φόρτωση...</div>
                ) : error ? (
                  <div className="p-8 text-center text-red-500">{error}</div>
                ) : (
                  reservationsData.length === 0 ? (
                    <div className="p-8 text-lg font-semibold text-center text-gray-500">Δεν υπάρχουν διαθέσιμα μαθήματα</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead className="border-b border-gray-500 bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-sm font-medium text-left text-gray-900">Ώρα</th>
                            <th className="px-4 py-3 text-sm font-medium text-left text-gray-900">Μάθημα</th>
                            <th className="px-4 py-3 text-sm font-medium text-center text-gray-900">Κρατήσεις</th>
                            <th className="px-4 py-3 text-sm font-medium text-center text-gray-900">+</th>
                            <th className="px-4 py-3 text-sm font-medium text-center text-gray-900">Διαγραφή</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-400">
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
                                <Button 
                                  size="sm" 
                                  className="w-8 h-8 p-0 bg-green-600 rounded-full hover:bg-green-700"
                                  onClick={() => handleAddUserClick(reservation)}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Button 
                                  size="sm" 
                                  variant="destructive" 
                                  className="px-2 text-xs"
                                  onClick={() => handleDeleteClass(reservation)}
                                >
                                  Διαγραφή
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reservations Modal */}
        <ReservationsModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          reservation={selectedReservation} 
          formatDate={formatDate} 
          clients={reservationClients} 
          clientsLoading={clientsLoading}
          setReservationClients={setReservationClients}
          setReservationsData={setReservationsData}
        />
        
        {/* Add User Modal */}
        <AddUserModal 
          isOpen={isAddUserModalOpen} 
          onClose={closeAddUserModal} 
          reservation={selectedClassForAddUser}
          userName={newUserName}
          setUserName={setNewUserName}
          onAddUser={handleAddUser}
        />

        {/* Delete User Modal is now rendered inside ReservationsModal */}

        {/* Toast Container */}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </div>
  )
}

// Reservations Modal Component

function ReservationsModal({ isOpen, onClose, reservation, formatDate, clients, clientsLoading, setReservationClients, setReservationsData }) {
  // Get setReservationsData from parent via context or prop (we'll use a workaround: window._setReservationsData)
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [deletePopup, setDeletePopup] = useState({ open: false, type: '', message: '' });

  // Try to use reservation.date or reservation.classDate for the date, fallback to empty if not present
  let classDate = reservation?.date || reservation?.classDate || reservation?.class_date || null;

  // Delete user from class
  // Delete user from class (delete booking by booking_id)
  const handleDeleteUser = async (bookingId, userName) => {
    if (!bookingId || !reservation) return;
    setDeletingUserId(bookingId);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings/${bookingId}`, {
        withCredentials: true
      });
      // Refresh the clients list
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings/${reservation.id}`, { 
        withCredentials: true 
      });
      if (typeof setReservationClients === 'function') {
        setReservationClients(res.data);
      }
      // Update the number of participants in the parent reservation list
      if (typeof setReservationsData === 'function') {
        setReservationsData((prev) => prev.map(r => {
          if ((r.id || r.class_id) === (reservation.id || reservation.class_id)) {
            return {
              ...r,
              current_participants: (r.current_participants || 1) - 1
            };
          }
          return r;
        }));
      }
      // Show success popup
      setDeletePopup({ open: true, type: 'success', message: `Ο χρήστης αφαιρέθηκε από το μάθημα επιτυχώς!` });
      setTimeout(() => {
        setDeletePopup({ open: false, type: '', message: '' });
      }, 1500);
    } catch (error) {
      setDeletePopup({ open: true, type: 'error', message: 'Σφάλμα κατά την αφαίρεση χρήστη από το μάθημα.' });
      setTimeout(() => {
        setDeletePopup({ open: false, type: '', message: '' });
      }, 2000);
    }
    setDeletingUserId(null);
  };

  if (!isOpen || !reservation) return null;

  return (
    <>
      <style jsx global>{`
        .modal-fadein {
          animation: modalFadeIn 0.3s ease-out both;
        }
        @keyframes modalFadeIn {
          0% { opacity: 0; transform: scale(0.95) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-blur-bg {
          backdrop-filter: blur(4px);
          background: rgba(0,0,0,0.15) !important;
        }
        .delete-popup-blur {
          backdrop-filter: blur(6px);
          background: rgba(0,0,0,0.18) !important;
        }
        .delete-popup-anim {
          animation: deletePopupAnim 0.45s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes deletePopupAnim {
          0% { opacity: 0; transform: translateY(30px) scale(0.95); }
          60% { opacity: 1; transform: translateY(-8px) scale(1.03); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center modal-blur-bg">
        <div className="relative w-full max-w-2xl mx-4 bg-white border-2 border-black rounded-lg shadow-2xl modal-fadein">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-black">Κρατήσεις</h2>
            <button onClick={onClose} className="text-black hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {/* Class Details */}
            <div className="mb-6 space-y-2">
              <div className="space-y-1">
                <p className="text-black">
                  <span className="font-medium">Μάθημα:</span> {reservation.class_name || reservation.className}
                </p>
                <p className="text-black">
                  <span className="font-medium">Ημερομηνία:</span> {classDate ? formatDate(classDate) : ''}
                </p>
                <p className="text-black">
                  <span className="font-medium">Ώρα:</span> {formatTime(reservation.time || reservation.timeFrom) || '-'}
                </p>
                <p className="text-black">
                  <span className="font-medium">Κρατήσεις:</span> {reservation.current_participants || reservation.booked || 0}
                </p>
              </div>
            </div>

            {/* Clients Table - Improved UI */}
            <div className="mb-4 overflow-hidden border-2 border-gray-500 shadow-sm rounded-xl">
              <table className="w-full text-sm">
                <thead className="border-b-2 border-gray-500 bg-gradient-to-r from-gray-100 to-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold tracking-wide text-center text-gray-800 rounded-tl-xl">#</th>
                    <th className="px-4 py-3 font-semibold tracking-wide text-center text-gray-800">Όνομα Χρήστη</th>
                    <th className="px-4 py-3 font-semibold tracking-wide text-center text-gray-800 rounded-tr-xl">Διαγραφή</th>
                  </tr>
                </thead>
                <tbody>
                  {clientsLoading ? (
                    <tr><td colSpan="3" className="px-4 py-8 text-center text-gray-700">Φόρτωση...</td></tr>
                  ) : clients && clients.length > 0 ? (
                    clients.map((client, index) => (
                      <tr
                        key={client.id || index}
                        className={
                          `transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50` +
                          (index === 0 ? ' rounded-t-xl' : '') +
                          (index === clients.length - 1 ? ' rounded-b-xl' : '')
                        }
                      >
                        <td className="px-4 py-3 font-mono text-center text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3 font-medium text-center text-gray-900">{client.name}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDeleteUser(client.booking_id || client.id || client.user_id, client.name)}
                            className={`flex items-center justify-center w-8 h-8 text-white bg-[#e71111] rounded-full transition-colors mx-auto ${deletingUserId === (client.booking_id || client.id || client.user_id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={`Αφαίρεση του ${client.name} από το μάθημα`}
                            disabled={deletingUserId === (client.booking_id || client.id || client.user_id)}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-4 py-10 italic text-center text-gray-400 bg-white rounded-b-xl">
                        Δεν υπάρχουν κρατήσεις για αυτό το μάθημα
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Close Button */}
            <div className="flex justify-center mt-2">
              <button
                onClick={onClose}
                className="px-6 py-2 font-medium text-white transition-colors bg-black rounded-lg hover:bg-gray-800"
              >
                Κλείσιμο
              </button>
            </div>
          </div>

          {/* Custom Delete Popup */}
          {deletePopup.open && (
            <div className="fixed inset-0 flex items-center justify-center z-60 delete-popup-blur">
              <div className={`delete-popup-anim px-8 py-6 rounded-2xl shadow-2xl border-2 ${deletePopup.type === 'success' ? 'bg-green-500 border-green-700' : 'bg-red-500 border-red-700'} flex flex-col items-center min-w-[280px] max-w-[90vw]`}
                   style={{ minHeight: 120 }}>
                {deletePopup.type === 'success' ? (
                  <svg className="w-10 h-10 mb-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-10 h-10 mb-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                )}
                <div className="mb-1 text-lg font-semibold text-center text-white">
                  {deletePopup.message}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Add User Modal Component
function AddUserModal({ isOpen, onClose, reservation, userName, setUserName, onAddUser }) {
  const [saving, setSaving] = useState(false);
  if (!isOpen || !reservation) return null

  // Handler for Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && userName.trim() && !saving) {
      handleAddUserWithIndicator();
    }
  };

  // Wrap onAddUser to show indicator
  const handleAddUserWithIndicator = async () => {
    if (!userName.trim() || saving) return;
    setSaving(true);
    try {
      await onAddUser();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        .add-user-modal-fadein {
          animation: addUserModalFadeIn 0.3s ease-out both;
        }
        @keyframes addUserModalFadeIn {
          0% { opacity: 0; transform: scale(0.95) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .add-user-modal-blur-bg {
          backdrop-filter: blur(8px);
          background: rgba(0,0,0,0.7) !important;
        }
        .spinner {
          border: 2px solid #f3f3f3;
          border-top: 2px solid #222;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          animation: spin 0.7s linear infinite;
          display: inline-block;
          vertical-align: middle;
          margin-right: 8px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center add-user-modal-blur-bg">
        <div className="w-full max-w-md mx-4 bg-white border-2 border-black rounded-lg shadow-2xl add-user-modal-fadein">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-black">Προσθήκη Χρήστη</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-black" disabled={saving}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {/* Class Info */}
            <div className="mb-4">
              <p className="mb-2 text-sm text-gray-600">
                Μάθημα: <span className="font-medium text-black">{reservation.class_name}</span>
              </p>
              <p className="text-sm text-gray-600">
                Ώρα: <span className="font-medium text-black">{formatTime(reservation.time) || '-'}</span>
              </p>
            </div>

            {/* User Name Input */}
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-black">
                Όνομα Χρήστη
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Εισάγετε το όνομα του χρήστη"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                autoFocus
                disabled={saving}
              />
            </div>

            {/* Add Button */}
            <div className="flex justify-center">
              <button
                onClick={handleAddUserWithIndicator}
                disabled={!userName.trim() || saving}
                className="flex items-center justify-center px-6 py-2 font-medium text-white transition-colors bg-black rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving && <span className="spinner" />}
                Προσθήκη
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Delete User Modal Component
function DeleteUserModal({ isOpen, onClose, reservation, clients, clientsLoading, onDeleteUser, formatDate }) {
  if (!isOpen || !reservation) return null

  // Try to use reservation.date or reservation.classDate for the date, fallback to empty if not present
  let classDate = reservation.date || reservation.classDate || reservation.class_date || null;

  return (
    <>
      <style jsx global>{`
        .delete-modal-fadein {
          animation: deleteModalFadeIn 0.3s ease-out both;
        }
        @keyframes deleteModalFadeIn {
          0% { opacity: 0; transform: scale(0.95) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .delete-modal-blur-bg {
          backdrop-filter: blur(8px);
          background: rgba(0,0,0,0.7) !important;
        }
      `}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center delete-modal-blur-bg">
        <div className="w-full max-w-2xl mx-4 bg-white border-2 border-black rounded-lg shadow-2xl delete-modal-fadein">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b ">
            <h2 className="text-lg font-semibold text-black">Διαγραφή Χρηστών από Μάθημα</h2>
            <button onClick={onClose} className="text-black hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {/* Class Details */}
            <div className="mb-6 space-y-2">
              <div className="space-y-1">
                <p className="text-black">
                  <span className="font-medium">Μάθημα:</span> {reservation.class_name || reservation.className}
                </p>
                <p className="text-black">
                  <span className="font-medium">Ημερομηνία:</span> {classDate ? formatDate(classDate) : ''}
                </p>
                <p className="text-black">
                  <span className="font-medium">Ώρα:</span> {formatTime(reservation.time || reservation.timeFrom) || '-'}
                </p>
                <p className="text-black">
                  <span className="font-medium">Συνολικές Κρατήσεις:</span> {reservation.current_participants || reservation.booked || 0}
                </p>
              </div>
            </div>

            {/* Clients Table */}
            <div className="overflow-hidden border-2 border-gray-500 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-500 ">
                  <tr>
                    <th className="px-4 py-3 text-sm font-medium text-center text-black">Όνομα Χρήστη</th>
                    <th className="px-4 py-3 text-sm font-medium text-center text-black">Διαγραφή Χρήστη</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black">
                  {clientsLoading ? (
                    <tr><td colSpan="2" className="px-4 py-8 text-center text-black">Φόρτωση...</td></tr>
                  ) : clients && clients.length > 0 ? (
                    clients.map((client, index) => (
                      <tr key={client.id || index} className="">
                        <td className="px-4 py-3 text-sm text-center text-black">{client.name}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => onDeleteUser(client.id || client.user_id, client.name)}
                            className="flex items-center justify-center w-8 h-8 text-white bg-[#e71111] rounded-full transition-colors mx-auto"
                            title={`Αφαίρεση του ${client.name} από το μάθημα`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="px-4 py-8 text-center text-black">
                        Δεν υπάρχουν κρατήσεις για αυτό το μάθημα
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Close Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={onClose}
                className="px-6 py-2 font-medium text-white transition-colors bg-black rounded-lg hover:bg-gray-800"
              >
                Κλείσιμο
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Toast Container Component
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[60] space-y-2">
      {toasts.map((toast) => (
        <Toast 
          key={toast.id} 
          toast={toast} 
          onRemove={() => removeToast(toast.id)} 
        />
      ))}
    </div>
  )
}

// Individual Toast Component
function Toast({ toast, onRemove }) {
  const { message, type } = toast

  const bgColor = type === 'success' 
    ? 'bg-gradient-to-r from-green-500 to-green-600' 
    : 'bg-gradient-to-r from-red-500 to-red-600'

  const icon = type === 'success' ? (
    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )

  return (
    <>
      <style jsx>{`
        .toast-slide-in {
          animation: toastSlideIn 0.3s ease-out both;
        }
        @keyframes toastSlideIn {
          0% { 
            opacity: 0; 
            transform: translateX(100%) scale(0.9); 
          }
          100% { 
            opacity: 1; 
            transform: translateX(0) scale(1); 
          }
        }
      `}</style>
      <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg border border-white/20 min-w-[300px] max-w-sm toast-slide-in flex items-center space-x-3`}>
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 text-sm font-medium">
          {message}
        </div>
        <button
          onClick={onRemove}
          className="flex-shrink-0 transition-colors text-white/80 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </>
  )
}