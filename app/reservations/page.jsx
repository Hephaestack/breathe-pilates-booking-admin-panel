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
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [selectedClassForAddUser, setSelectedClassForAddUser] = useState(null)
  const [newUserName, setNewUserName] = useState("")
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedClassForDelete, setSelectedClassForDelete] = useState(null)
  const [deleteModalClients, setDeleteModalClients] = useState([])
  const [deleteModalLoading, setDeleteModalLoading] = useState(false)

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
      // Add your API call here to add user to class
      // await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings`, {
      //   class_id: selectedClassForAddUser.id,
      //   user_name: newUserName
      // }, { withCredentials: true })
      
      alert(`User "${newUserName}" added to class successfully!`)
      closeAddUserModal()
      
      // Refresh reservations data
      // You might want to refresh the data here
      
    } catch (error) {
      alert("Error adding user to class")
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    if (!userId || !selectedClassForDelete) return
    
    try {
      // Delete user using the correct endpoint from API documentation
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}`, {
        withCredentials: true
      })
      
      alert("User removed from class successfully!")
      
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
      alert("Error removing user from class: " + (error.response?.data?.detail || error.message))
    }
  }

  const handleDeleteButtonClick = async (reservation) => {
    setSelectedClassForDelete(reservation)
    setDeleteModalLoading(true)
    setIsDeleteModalOpen(true)
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/bookings/${reservation.id}`, { withCredentials: true });
      setDeleteModalClients(res.data);
    } catch (e) {
      setDeleteModalClients([]);
    }
    setDeleteModalLoading(false);
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setSelectedClassForDelete(null)
    setDeleteModalClients([])
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
                                onClick={() => handleDeleteButtonClick(reservation)}
                              >
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
        <ReservationsModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          reservation={selectedReservation} 
          formatDate={formatDate} 
          clients={reservationClients} 
          clientsLoading={clientsLoading}
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

        {/* Delete User Modal */}
        <DeleteUserModal 
          isOpen={isDeleteModalOpen} 
          onClose={closeDeleteModal} 
          reservation={selectedClassForDelete}
          clients={deleteModalClients}
          clientsLoading={deleteModalLoading}
          onDeleteUser={handleDeleteUser}
          formatDate={formatDate}
        />
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
                      <tr key={client.id || index} className="hover:bg-gray-800">
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

// Add User Modal Component
function AddUserModal({ isOpen, onClose, reservation, userName, setUserName, onAddUser }) {
  if (!isOpen || !reservation) return null

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
      `}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center add-user-modal-blur-bg">
        <div className="w-full max-w-md mx-4 bg-white border-2 border-black rounded-lg shadow-2xl add-user-modal-fadein">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-black">Προσθήκη Χρήστη</h2>
            <button onClick={onClose} className="text-gray-600 hover:text-black">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {/* Class Info */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Μάθημα: <span className="font-medium text-black">{reservation.class_name}</span>
              </p>
              <p className="text-sm text-gray-600">
                Ώρα: <span className="font-medium text-black">{formatTime(reservation.time) || '-'}</span>
              </p>
            </div>

            {/* User Name Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-2">
                Όνομα Χρήστη
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Εισάγετε το όνομα του χρήστη"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                autoFocus
              />
            </div>

            {/* Add Button */}
            <div className="flex justify-center">
              <button
                onClick={onAddUser}
                disabled={!userName.trim()}
                className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
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
          <div className="flex items-center justify-between p-4 border-b border-black">
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
            <div className="overflow-hidden border-2 border-black rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-black">
                  <tr>
                    <th className="px-4 py-3 text-sm font-medium text-center text-black">Όνομα Χρήστη</th>
                    <th className="px-4 py-3 text-sm font-medium text-center text-black">Delete User</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black">
                  {clientsLoading ? (
                    <tr><td colSpan="2" className="px-4 py-8 text-center text-black">Φόρτωση...</td></tr>
                  ) : clients && clients.length > 0 ? (
                    clients.map((client, index) => (
                      <tr key={client.id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-center text-black">{client.name}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => onDeleteUser(client.id || client.user_id, client.name)}
                            className="flex items-center justify-center w-8 h-8 text-white bg-black rounded-full hover:bg-gray-800 transition-colors mx-auto"
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
                className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
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