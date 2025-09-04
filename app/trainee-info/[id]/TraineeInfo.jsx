"use client"

import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { Button } from '@mui/material'
import { ArrowLeft, Edit2, Save, X } from 'lucide-react'
import { useStudio } from '../../contexts/StudioContext'

// Fetcher function for SWR
const fetcher = url => axios.get(url, { withCredentials: true }).then(res => res.data)

export default function TraineeInfo({ id }) {
  const router = useRouter()
  const { refreshData } = useStudio()

  // Edit personal info state
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    gender: '',
    phone: '',
    city: '',
    studio_id: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Studios state
  const [studios, setStudios] = useState([]);
  const [loadingStudios, setLoadingStudios] = useState(true);

  // Fetch studios on component mount
  useEffect(() => {
    const fetchStudios = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/studios`,
          { withCredentials: true }
        )
        console.log('Studios API response (trainee-info advanced):', response.data)
        
        // Handle both current backend format (array of strings) and future format (array of objects)
        if (Array.isArray(response.data)) {
          if (response.data.length > 0 && typeof response.data[0] === 'string') {
            // Current backend format: ["Studio Name 1", "Studio Name 2"]
            const studiosWithIds = response.data.map((name, index) => ({
              id: index.toString(), // Temporary ID until backend is fixed
              name: name
            }))
            console.log('Converted studios (trainee-info advanced):', studiosWithIds)
            setStudios(studiosWithIds)
          } else {
            // Future backend format: [{id: "uuid", name: "Studio Name"}]
            setStudios(response.data)
          }
        } else {
          console.error('Unexpected studios data format:', response.data)
          setStudios([])
        }
      } catch (error) {
        console.error("Error fetching studios:", error)
      } finally {
        setLoadingStudios(false)
      }
    }

    fetchStudios()
  }, [])

  // Helper function to get studio name by ID
  const getStudioName = (studioId) => {
    const studio = studios.find(s => s.id === studioId)
    return studio ? studio.name : 'Δεν βρέθηκε'
  }

  // Handle edit form changes
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  // Start editing
  const handleStartEdit = () => {
    setEditForm({
      name: traineeData?.name || '',
      gender: traineeData?.gender || '',
      phone: traineeData?.phone || '',
      city: traineeData?.city || '',
      studio_id: traineeData?.studio_id || ''
    })
    setIsEditingPersonal(true)
    setEditError('')
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditingPersonal(false)
    setEditForm({
      name: '',
      gender: '',
      phone: '',
      city: '',
      studio_id: ''
    })
    setEditError('')
  }

  // Save edited information
  const handleSaveEdit = async () => {
    setEditLoading(true)
    setEditError('')
    
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${id}`,
        editForm,
        { withCredentials: true }
      )
      
      // Refresh trainee data
      mutate()
      
      // Refresh studio filtering if user was moved to different studio
      if (refreshData) {
        refreshData()
      }
      
      setIsEditingPersonal(false)
      setEditForm({
        name: '',
        gender: '',
        phone: '',
        city: '',
        studio_id: ''
      })
    } catch (error) {
      console.error('Error updating trainee:', error)
      setEditError('Σφάλμα κατά την ενημέρωση των στοιχείων')
    } finally {
      setEditLoading(false)
    }
  }

  // Fetch trainee data
  const { data: trainee, error: traineeError, isLoading: traineeLoading, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
    fetcher
  )

  // Fetch trainee's subscriptions
  const { data: subscriptions, error: subsError, isLoading: subsLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/${id}`,
    fetcher
  )

  // Fetch trainee's bookings
  const { data: bookings, error: bookingsError, isLoading: bookingsLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/bookings/${id}`,
    fetcher
  )

  // Format date function
  function formatDateDMY(dateString) {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  }

  // Loading state
  if (traineeLoading || subsLoading || bookingsLoading) {
    return (
      <div className="min-h-screen p-2 bg-gray-50 sm:p-4">
        <div className="mx-auto max-w-7xl">
          <div className="py-8 text-lg text-center text-gray-500">Φόρτωση...</div>
        </div>
      </div>
    )
  }

  // Error state
  if (traineeError || subsError || bookingsError) {
    return (
      <div className="min-h-screen p-2 bg-gray-50 sm:p-4">
        <div className="mx-auto max-w-7xl">
          <div className="py-8 text-lg text-center text-red-500">
            Σφάλμα κατά τη φόρτωση των δεδομένων
          </div>
        </div>
      </div>
    )
  }

  // Get the actual trainee data considering possible response structures
  const traineeData = trainee?.user || trainee
  const activeSubscription = subscriptions?.find(sub => 
    new Date(sub.end_date) >= new Date()
  ) || subscriptions?.[0]

  return (
    <div className="min-h-screen p-2 bg-gray-50 sm:p-4">
      <div className="mx-auto max-w-7xl">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            onClick={() => router.push("/trainee-list")}
            variant="outline"
            className="w-full bg-black text-white border-[#bbbbbb] hover:bg-gray-800 hover:text-white sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Επιστροφή στη Λίστα Μαθητών
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid gap-6">
          {/* Personal Information */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="p-6">
              <div className="flex flex-col items-center justify-between mb-4 sm:flex-row">
                <h2 className="text-2xl font-bold">Προσωπικές Πληροφορίες</h2>
                {!isEditingPersonal ? (
                  <Button
                    onClick={handleStartEdit}
                    variant="outlined"
                    className="mt-2 sm:mt-0"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Επεξεργασία
                  </Button>
                ) : (
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <Button
                      onClick={handleSaveEdit}
                      disabled={editLoading}
                      variant="contained"
                      color="success"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editLoading ? 'Αποθήκευση...' : 'Αποθήκευση'}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outlined"
                      disabled={editLoading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Ακύρωση
                    </Button>
                  </div>
                )}
              </div>

              {editError && (
                <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                  {editError}
                </div>
              )}

              {!isEditingPersonal ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">Όνομα</p>
                    <p className="text-lg font-medium">{traineeData?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Φύλο</p>
                    <p className="text-lg font-medium">{traineeData?.gender || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Κινητό</p>
                    <p className="text-lg font-medium">{traineeData?.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Πόλη</p>
                    <p className="text-lg font-medium">{traineeData?.city || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Studio</p>
                    <p className="text-lg font-medium">
                      {!loadingStudios ? getStudioName(traineeData?.studio_id) : 'Φόρτωση...'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Κωδικός</p>
                    <p className="text-lg font-medium">{traineeData?.password || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ημερομηνία Εγγραφής</p>
                    <p className="text-lg font-medium">{formatDateDMY(traineeData?.created_at) || '-'}</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Όνομα</label>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={editLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Φύλο</label>
                    <select
                      name="gender"
                      value={editForm.gender}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={editLoading}
                    >
                      <option value="">Επιλέξτε φύλο</option>
                      <option value="Άνδρας">Άντρας</option>
                      <option value="Γυναίκα">Γυναίκα</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Κινητό</label>
                    <input
                      type="text"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={editLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Πόλη</label>
                    <input
                      type="text"
                      name="city"
                      value={editForm.city}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={editLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Studio</label>
                    <select
                      name="studio_id"
                      value={editForm.studio_id}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={editLoading || loadingStudios}
                    >
                      <option key="placeholder" value="">
                        {loadingStudios ? "Φόρτωση Studios..." : "Επιλέξτε Studio"}
                      </option>
                      {studios.filter(studio => studio && studio.id).map((studio, index) => (
                        <option key={`studio-${studio.id}-${index}`} value={studio.id}>
                          {studio.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Κωδικός</p>
                    <p className="text-lg font-medium">{traineeData?.password || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ημερομηνία Εγγραφής</p>
                    <p className="text-lg font-medium">{formatDateDMY(traineeData?.created_at) || '-'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Subscription */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="p-6">
              <h2 className="mb-4 text-2xl font-bold">Ενεργή Συνδρομή</h2>
              {activeSubscription ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-500">Τύπος Συνδρομής</p>
                    <p className="text-lg font-medium">{activeSubscription.subscription_model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Κατάσταση</p>
                    <p className={`text-lg font-medium ${new Date(activeSubscription.end_date) >= new Date() ? 'text-green-600' : 'text-red-600'}`}>
                      {new Date(activeSubscription.end_date) >= new Date() ? 'Ενεργή' : 'Ανενεργή'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ημερομηνία Έναρξης</p>
                    <p className="text-lg font-medium">{formatDateDMY(activeSubscription.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ημερομηνία Λήξης</p>
                    <p className="text-lg font-medium">{formatDateDMY(activeSubscription.end_date)}</p>
                  </div>
                  {activeSubscription.subscription_model?.toLowerCase().includes('πακέτο') && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Σύνολο Συνεδριών</p>
                        <p className="text-lg font-medium">{activeSubscription.package_total || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Υπόλοιπο Συνεδριών</p>
                        <p className="text-lg font-medium">{activeSubscription.remaining_classes || '-'}</p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-lg text-gray-500">Δεν βρέθηκε ενεργή συνδρομή</p>
              )}
            </div>
          </div>

          {/* Subscription History */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="p-6">
              <h2 className="mb-4 text-2xl font-bold">Ιστορικό Συνδρομών</h2>
              {subscriptions && subscriptions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Τύπος Συνδρομής</th>
                        <th className="py-2 text-left">Έναρξη</th>
                        <th className="py-2 text-left">Λήξη</th>
                        <th className="py-2 text-left">Σύνολο Συνεδριών</th>
                        <th className="py-2 text-left">Υπόλοιπο</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map((sub, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{sub.subscription_model}</td>
                          <td className="py-2">{formatDateDMY(sub.start_date)}</td>
                          <td className="py-2">{formatDateDMY(sub.end_date)}</td>
                          <td className="py-2">{sub.package_total || '-'}</td>
                          <td className="py-2">{sub.remaining_classes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-lg text-gray-500">Δεν βρέθηκε ιστορικό συνδρομών</p>
              )}
            </div>
          </div>

          {/* Bookings History */}
          <div className="bg-white shadow-sm rounded-lg">
            <div className="p-6">
              <h2 className="mb-4 text-2xl font-bold">Ιστορικό Κρατήσεων</h2>
              {bookings && bookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Μάθημα</th>
                        <th className="py-2 text-left">Ημερομηνία</th>
                        <th className="py-2 text-left">Ώρα</th>
                        <th className="py-2 text-left">Κατάσταση</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => {
                        const bookingDate = new Date(booking.date);
                        const formattedTime = bookingDate.toLocaleTimeString('el-GR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        });

                        return (
                          <tr key={booking.booking_id} className="border-b hover:bg-gray-50">
                            <td className="py-3">{booking.class_name}</td>
                            <td className="py-3">{formatDateDMY(booking.date)}</td>
                            <td className="py-3">{formattedTime}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 text-sm rounded-full ${
                                booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {booking.status === 'completed' ? 'Ολοκληρώθηκε' :
                                 booking.status === 'cancelled' ? 'Ακυρώθηκε' :
                                 'Προγραμματισμένο'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-lg text-gray-500">Δεν βρέθηκαν κρατήσεις</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
