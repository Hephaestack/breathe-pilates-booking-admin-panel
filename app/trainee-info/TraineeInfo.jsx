"use client"

import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { Button } from "../components/ui/button"
import { ArrowLeft, Edit2, Save, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { elGR } from '@mui/x-date-pickers/locales';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { swrConfig, fetcher } from '../../lib/swr-config';

export default function TraineeInfo({ id }) {
  // Modal state for adding subscription
  const [showAddSubsModal, setShowAddSubsModal] = useState(false);
  const [newSubs, setNewSubs] = useState({
    subscription_model: '',
    start_date: '',
    end_date: '',
    price: '',
    payment_status: 'Εκκρεμεί',
  });
  const [addSubsLoading, setAddSubsLoading] = useState(false);
  const [addSubsError, setAddSubsError] = useState('');
  const [deleteSubsId, setDeleteSubsId] = useState(null);
  const [deleteSubsLoading, setDeleteSubsLoading] = useState(false);

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
        console.log('Studios API response (trainee-info):', response.data)
        
        // Handle both current backend format (array of strings) and future format (array of objects)
        if (Array.isArray(response.data)) {
          if (response.data.length > 0 && typeof response.data[0] === 'string') {
            // Current backend format: ["Studio Name 1", "Studio Name 2"]
            const studiosWithIds = response.data.map((name, index) => ({
              id: index.toString(), // Temporary ID until backend is fixed
              name: name
            }))
            console.log('Converted studios (trainee-info):', studiosWithIds)
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

  const handleOpenAddSubsModal = () => {
    setShowAddSubsModal(true);
    setAddSubsError('');
  };
  const handleCloseAddSubsModal = () => {
    setShowAddSubsModal(false);
    setNewSubs({ subscription_model: '', start_date: '', end_date: '', price: '', payment_status: 'Εκκρεμεί' });
    setAddSubsError('');
  };
  const handleAddSubsChange = (e) => {
    setNewSubs({ ...newSubs, [e.target.name]: e.target.value });
  };
  
  const handleDeleteSubs = async (subscriptionId) => {
    setDeleteSubsLoading(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions/${subscriptionId}`,
        { withCredentials: true }
      );
      mutateSubscriptions();
      setDeleteSubsId(null);
    } catch (error) {
      console.error('Error deleting subscription:', error);
      // You could add a toast notification here for error feedback
    } finally {
      setDeleteSubsLoading(false);
    }
  };
  const handleAddSubsSubmit = async (e) => {
    e.preventDefault();
    setAddSubsLoading(true);
    setAddSubsError('');
    try {
      // Convert date strings to ISO datetime format
      const formattedData = {
        ...newSubs,
        start_date: new Date(newSubs.start_date).toISOString(),
        end_date: new Date(newSubs.end_date).toISOString(),
        price: newSubs.price ? parseFloat(newSubs.price) : null
      };
      
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions/${id}`,
        formattedData,
        { withCredentials: true }
      );
      mutateSubscriptions();
      handleCloseAddSubsModal();
    } catch (err) {
      console.error('Error adding subscription:', err);
      if (err.response?.status === 422) {
        setAddSubsError('Σφάλμα επικύρωσης δεδομένων. Παρακαλώ ελέγξτε τα στοιχεία.');
      } else if (err.response?.status === 500) {
        setAddSubsError('Σφάλμα διακομιστή. Παρακαλώ δοκιμάστε ξανά.');
      } else {
        setAddSubsError('Σφάλμα κατά την προσθήκη συνδρομής');
      }
    } finally {
      setAddSubsLoading(false);
    }
  };
  const router = useRouter()

  // Fetch trainee data and subscriptions first
  const { data: trainee, error: traineeError, isLoading: traineeLoading, mutate } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
    fetcher,
    swrConfig
  )

  // Fetch trainee's subscriptions
  const { data: subscriptions, error: subsError, isLoading: subsLoading, mutate: mutateSubscriptions } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/${id}`,
    fetcher,
    swrConfig
  )

  // Fetch subscription types using SWR
  const { data: subscriptionTypes = [] } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions`,
    async (url) => {
      const res = await axios.get(url, { withCredentials: true });
      if (Array.isArray(res.data)) return res.data;
      if (res.data?.models) return res.data.models;
      return [];
    },
    swrConfig
  )

  // Find active subscription early to use in subsequent hooks
  const activeSubscription = subscriptions?.find(sub => 
    new Date(sub.end_date) >= new Date()
  ) || subscriptions?.[0]



  // Fetch trainee's bookings
  const bookingsUrl = id ? `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${id}/bookings` : null;
  
  const { data: bookings, error: bookingsError, isLoading: bookingsLoading } = useSWR(
    bookingsUrl,
    async (url) => {
      const res = await axios.get(url, { withCredentials: true });
      console.log('Bookings response:', res.data);
      if (Array.isArray(res.data)) {
        // Transform the data to match our component's expected format
        return res.data.map(booking => ({
          booking_id: booking.booking_id,
          class_name: booking.class_.class_name,
          date: booking.class_.date,
          time: booking.class_.time.split(':').slice(0, 2).join(':') // Remove seconds from time
        }));
      }
      return [];
    },
    swrConfig
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

  return (
    <div className="min-h-screen p-2 bg-gray-50 sm:p-4">
      <div className={`mx-auto max-w-7xl transition-all duration-300 ${showAddSubsModal ? 'blur-sm' : ''}`}>
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
        <div className="grid max-w-full gap-6">
          {/* Personal Information */}
          <div className="transition-shadow duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col items-center justify-between mb-4 sm:flex-row">
                <h2 className="text-xl font-bold text-center text-gray-800 sm:text-2xl sm:text-left">Προσωπικές Πληροφορίες</h2>
                {!isEditingPersonal ? (
                  <Button
                    onClick={handleStartEdit}
                    variant="outline"
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
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {editLoading ? 'Αποθήκευση...' : 'Αποθήκευση'}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
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
                <div className="grid gap-6 sm:gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-500">Όνομα</p>
                    <p className="text-lg font-medium">{traineeData?.name || '-'}</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-500">Φύλο</p>
                    <p className="text-lg font-medium">{traineeData?.gender || '-'}</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-500">Κινητό</p>
                    <p className="text-lg font-medium">{traineeData?.phone || '-'}</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-500">Πόλη</p>
                    <p className="text-lg font-medium">{traineeData?.city || '-'}</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-500">Studio</p>
                    <p className="text-lg font-medium">
                      {!loadingStudios ? getStudioName(traineeData?.studio_id) : 'Φόρτωση...'}
                    </p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-500">Κωδικός</p>
                    <p className="text-lg font-medium">{traineeData?.password || '-'}</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-500">Ημερομηνία Εγγραφής</p>
                    <p className="text-lg font-medium">{formatDateDMY(traineeData?.created_at) || '-'}</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
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
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-500">Κωδικός</p>
                    <p className="text-lg font-medium">{traineeData?.password || '-'}</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-500">Ημερομηνία Εγγραφής</p>
                    <p className="text-lg font-medium">{formatDateDMY(traineeData?.created_at) || '-'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Subscription */}
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm">
            <div className="p-6">
              <h2 className="mb-4 text-2xl font-bold text-center sm:text-left">Ενεργή Συνδρομή</h2>
              {activeSubscription ? (
                <div className="grid gap-6 sm:gap-4 sm:grid-cols-2">
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-500">Τύπος Συνδρομής</p>
                    <p className="text-lg font-medium">{activeSubscription.subscription_model}</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-500">Κατάσταση</p>
                    <p className={`text-lg font-medium ${new Date(activeSubscription.end_date) >= new Date() ? 'text-green-600' : 'text-red-600'}`}>
                      {new Date(activeSubscription.end_date) >= new Date() ? 'Ενεργή' : 'Ανενεργή'}
                    </p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-500">Ημερομηνία Έναρξης</p>
                    <p className="text-lg font-medium">{formatDateDMY(activeSubscription.start_date)}</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-500">Ημερομηνία Λήξης</p>
                    <p className="text-lg font-medium">{formatDateDMY(activeSubscription.end_date)}</p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-500">Τιμή</p>
                    <p className="text-lg font-medium">{activeSubscription.price ? `${activeSubscription.price}€` : '-'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-lg text-center text-gray-500 sm:text-left">Δεν βρέθηκε ενεργή συνδρομή</p>
              )}
            </div>
          </div>

          {/* Subscription History */}
          <div className="transition-shadow duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col items-center gap-4 mb-4 sm:flex-row sm:justify-between">
                <h2 className="text-xl font-bold text-center text-gray-800 sm:text-left sm:text-2xl">Ιστορικό Συνδρομών</h2>
                <button
                  type="button"
                  className="flex items-center gap-2 px-4 py-2 text-white transition-colors duration-200 bg-green-600 rounded-lg hover:bg-green-700 sm:hidden"
                  title="Προσθήκη νέας συνδρομής"
                  onClick={handleOpenAddSubsModal}
                >
                  <span className="text-lg">✚</span>
                  <span>Νέα Συνδρομή</span>
                </button>
                <button
                  type="button"
                  className="items-center hidden gap-2 px-4 py-2 text-white transition-colors duration-200 bg-green-600 rounded-lg sm:flex hover:bg-green-700"
                  title="Προσθήκη νέας συνδρομής"
                  onClick={handleOpenAddSubsModal}
                >
                  <span className="text-lg">✚</span>
                  <span>Νέα Συνδρομή</span>
                </button>
              </div>
              {subscriptions && subscriptions.length > 0 ? (
                <div className="overflow-hidden border-2 border-gray-200 rounded-lg shadow-sm">
                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                      <table className="min-w-full divide-y-2 divide-gray-200">
                        <thead className="hidden lg:table-header-group bg-gray-50">
                          <tr>
                            <th scope="col" className="py-4 pl-4 pr-3 text-sm font-semibold text-center text-gray-900 sm:pl-6">Τύπος Συνδρομής</th>
                            <th scope="col" className="hidden px-3 py-4 text-sm font-semibold text-center text-gray-900 sm:table-cell">Έναρξη</th>
                            <th scope="col" className="hidden px-3 py-4 text-sm font-semibold text-center text-gray-900 sm:table-cell">Λήξη</th>
                            <th scope="col" className="px-3 py-4 text-sm font-semibold text-center text-gray-900">Τιμή</th>
                            <th scope="col" className="px-3 py-4 text-sm font-semibold text-center text-gray-900">Κατάσταση Πληρωμής</th>
                            <th scope="col" className="px-3 py-4 text-sm font-semibold text-center text-gray-900">Ενέργειες</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {subscriptions.map((sub, index) => (
                            <tr key={index} className="flex flex-col transition-colors duration-200 hover:bg-gray-50 lg:table-row">
                              <td className="flex items-center justify-center gap-2 px-3 py-4 text-sm font-medium text-center text-gray-900 border-b border-gray-200 whitespace-nowrap lg:border-b-0 lg:border-r">
                                <div className="mb-1 font-semibold lg:hidden">Τύπος Συνδρομής:</div>
                                <select
                                  className="w-auto min-w-[120px] px-3 py-2 border rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer text-center border-gray-200 hover:bg-gray-50"
                                  value={sub.subscription_model}
                                  onChange={async (e) => {
                                    const newValue = e.target.value;
                                    try {
                                      mutateSubscriptions(
                                        subscriptions.map(s => 
                                          s.id === sub.id 
                                            ? { ...s, subscription_model: newValue }
                                            : s
                                        ),
                                        false
                                      );
                                      await axios.put(
                                        `${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions/${sub.id}`,
                                        { subscription_model: newValue },
                                        { withCredentials: true }
                                      );
                                      mutateSubscriptions();
                                    } catch (error) {
                                      console.error('Error updating subscription model:', error);
                                      mutateSubscriptions();
                                    }
                                  }}
                                >
                                  {subscriptionTypes ? (
                                    subscriptionTypes.map((type) => (
                                      <option key={type} value={type}>
                                        {type}
                                      </option>
                                    ))
                                  ) : (
                                    <option value="">Loading...</option>
                                  )}
                                </select>
                              </td>
                              <td className="px-3 py-4 text-sm text-center text-gray-500 border-b border-gray-200 whitespace-nowrap lg:border-b-0 lg:border-r">
                                <div className="mb-1 font-semibold lg:hidden">Έναρξη:</div>
                                <LocalizationProvider dateAdapter={AdapterDayjs} localeText={elGR.localeText}>
                                    <DatePicker
                                      value={dayjs(sub.start_date)}
                                      onChange={async (date) => {
                                        if (date && date.isValid()) {
                                          const formattedDate = date.format('YYYY-MM-DD');
                                          try {
                                            mutateSubscriptions(
                                              subscriptions.map(s => 
                                                s.id === sub.id 
                                                  ? { ...s, start_date: formattedDate }
                                                  : s
                                              ),
                                              false
                                            );
                                            await axios.put(
                                              `${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions/${sub.id}`,
                                              { start_date: formattedDate },
                                              { withCredentials: true }
                                            );
                                            mutateSubscriptions();
                                          } catch (error) {
                                            console.error('Error updating start date:', error);
                                            mutateSubscriptions();
                                          }
                                        }
                                      }}
                                      format="DD/MM/YYYY"
                                      slotProps={{
                                        textField: {
                                          variant: 'outlined',
                                          sx: {
                                            backgroundColor: '#fff',
                                            borderRadius: 2,
                                            color: '#111',
                                            fontWeight: 500,
                                            width: '100%',
                                            '& .MuiOutlinedInput-root': {
                                              borderRadius: 2,
                                              background: '#fff',
                                              color: '#111',
                                              fontWeight: 500,
                                              border: '1px solid #bbbbbb',
                                              '&:hover': {
                                                border: '1px solid #000',
                                              },
                                              '&.Mui-focused': {
                                                border: '1px solid #000',
                                              },
                                            },
                                            '& .MuiInputBase-input': {
                                              color: '#111',
                                              fontWeight: 500,
                                              background: '#fff',
                                              textAlign: 'center',
                                              py: 1,
                                              px: 2,
                                            }
                                          },
                                          size: 'small',
                                        }
                                      }}
                                    />
                                  </LocalizationProvider>
                              </td>
                              <td className="px-3 py-4 text-sm text-center text-gray-500 border-b border-gray-200 whitespace-nowrap lg:border-b-0 lg:border-r">
                                <div className="mb-1 font-semibold lg:hidden">Λήξη:</div>
                                <LocalizationProvider dateAdapter={AdapterDayjs} localeText={elGR.localeText}>
                                    <DatePicker
                                      value={dayjs(sub.end_date)}
                                      onChange={async (date) => {
                                        if (date && date.isValid()) {
                                          const formattedDate = date.format('YYYY-MM-DD');
                                          try {
                                            mutateSubscriptions(
                                              subscriptions.map(s => 
                                                s.id === sub.id 
                                                  ? { ...s, end_date: formattedDate }
                                                  : s
                                              ),
                                              false
                                            );
                                            await axios.put(
                                              `${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions/${sub.id}`,
                                              { end_date: formattedDate },
                                              { withCredentials: true }
                                            );
                                            mutateSubscriptions();
                                          } catch (error) {
                                            console.error('Error updating end date:', error);
                                            mutateSubscriptions();
                                          }
                                        }
                                      }}
                                      format="DD/MM/YYYY"
                                      slotProps={{
                                        textField: {
                                          variant: 'outlined',
                                          sx: {
                                            backgroundColor: '#fff',
                                            borderRadius: 2,
                                            color: '#111',
                                            fontWeight: 500,
                                            width: '100%',
                                            '& .MuiOutlinedInput-root': {
                                              borderRadius: 2,
                                              background: '#fff',
                                              color: '#111',
                                              fontWeight: 500,
                                              border: '1px solid #bbbbbb',
                                              '&:hover': {
                                                border: '1px solid #000',
                                              },
                                              '&.Mui-focused': {
                                                border: '1px solid #000',
                                              },
                                            },
                                            '& .MuiInputBase-input': {
                                              color: '#111',
                                              fontWeight: 500,
                                              background: '#fff',
                                              textAlign: 'center',
                                              py: 1,
                                              px: 2,
                                            }
                                          },
                                          size: 'small',
                                        }
                                      }}
                                    />
                                  </LocalizationProvider>
                              </td>
                              <td className="px-3 py-4 text-sm text-center text-gray-500 border-b border-gray-200 whitespace-nowrap lg:border-b-0 lg:border-r">
                                <div className="mb-1 font-semibold lg:hidden">Τιμή:</div>
                                <input
                                  type="number"
                                  className="w-auto min-w-[80px] px-3 py-2 border rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer text-center border-gray-200 hover:bg-gray-50"
                                  value={sub.price || ''}
                                  placeholder="-"
                                  onChange={async (e) => {
                                    const newValue = e.target.value ? Number(e.target.value) : null;
                                    try {
                                      mutateSubscriptions(
                                        subscriptions.map(s => 
                                          s.id === sub.id 
                                            ? { ...s, price: newValue }
                                            : s
                                        ),
                                        false
                                      );
                                      await axios.put(
                                        `${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions/${sub.id}`,
                                        { price: newValue },
                                        { withCredentials: true }
                                      );
                                      mutateSubscriptions();
                                    } catch (error) {
                                      console.error('Error updating price:', error);
                                      mutateSubscriptions();
                                    }
                                  }}
                                />
                              </td>
                              <td className="px-3 py-4 text-sm text-center text-gray-500 border-b whitespace-nowrap lg:border-b-0">
                                <div className="mb-1 font-semibold lg:hidden">Κατάσταση Πληρωμής:</div>
                                <div className="flex justify-center">
                                  <select
                                    className={`w-auto min-w-[120px] px-3 py-2 border rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer text-center
                                      ${sub.payment_status === 'Πληρωμένη' 
                                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                                        : sub.payment_status === 'Εκκρεμεί'
                                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                      }`}
                                    value={sub.payment_status || 'Εκκρεμεί'}
                                    onChange={async (e) => {
                                      const newStatus = e.target.value;
                                      try {
                                        // Optimistically update the UI
                                        mutateSubscriptions(
                                          subscriptions.map(s => 
                                            s.id === sub.id 
                                              ? { ...s, payment_status: newStatus }
                                              : s
                                          ),
                                          false // Don't revalidate immediately
                                        );

                                        // Make the API call
                                        await axios.put(
                                          `${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions/${sub.id}`,
                                          { payment_status: newStatus },
                                          { withCredentials: true }
                                        );

                                        // Revalidate to ensure our data is correct
                                        mutateSubscriptions();
                                      } catch (error) {
                                        console.error('Error updating payment status:', error);
                                        // Revert the optimistic update on error
                                        mutateSubscriptions();
                                      }
                                    }}
                                  >
                                    <option value="Εκκρεμεί">Εκκρεμής</option>
                                    <option value="Πληρωμένη">Πληρώθηκε</option>
                                  </select>
                                </div>
                              </td>
                              <td className="px-3 py-4 text-sm text-center text-gray-500 border-b whitespace-nowrap lg:border-b-0">
                                <div className="mb-1 font-semibold lg:hidden">Ενέργειες:</div>
                                <div className="flex justify-center">
                                  <button
                                    type="button"
                                    className="flex items-center justify-center w-8 h-8 text-white transition-colors duration-200 bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    onClick={() => setDeleteSubsId(sub.id)}
                                    title="Διαγραφή συνδρομής"
                                  >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-lg text-center text-gray-500 sm:text-left">Δεν βρέθηκε ιστορικό συνδρομών</p>
              )}
            </div>
          </div>

          {/* Bookings History */}
          <div className="bg-white border-2 border-gray-200 rounded-lg shadow-sm">
            <div className="p-6">
              <h2 className="mb-4 text-2xl font-bold text-center">Ιστορικό Κρατήσεων</h2>
              {bookings && bookings.length > 0 ? (
                <div className="overflow-hidden border-2 border-gray-200 rounded-lg shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y-2 divide-gray-200">
                      <thead className="hidden lg:table-header-group bg-gray-50">
                        <tr>
                          <th scope="col" className="w-1/3 px-3 py-4 text-sm font-semibold text-center text-gray-900">Μάθημα</th>
                          <th scope="col" className="w-1/3 px-3 py-4 text-sm font-semibold text-center text-gray-900">Ημερομηνία</th>
                          <th scope="col" className="w-1/3 px-3 py-4 text-sm font-semibold text-center text-gray-900">Ώρα</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map((booking) => (
                          <tr key={booking.booking_id} className="flex flex-col hover:bg-gray-50 lg:table-row">
                            <td className="w-1/3 px-3 py-4 text-sm font-medium text-center text-gray-900 border-b border-gray-200 whitespace-nowrap lg:border-b-0 lg:border-r">
                              <div className="mb-1 font-semibold lg:hidden">Μάθημα:</div>
                              {booking.class_name}
                            </td>
                            <td className="w-1/3 px-3 py-4 text-sm text-center text-gray-500 border-b border-gray-200 whitespace-nowrap lg:border-b-0 lg:border-r">
                              <div className="mb-1 font-semibold lg:hidden">Ημερομηνία:</div>
                              {formatDateDMY(booking.date)}
                            </td>
                            <td className="w-1/3 px-3 py-4 text-sm text-center text-gray-500 border-b border-gray-200 whitespace-nowrap lg:border-b-0 lg:border-r">
                              <div className="mb-1 font-semibold lg:hidden">Ώρα:</div>
                              {booking.time}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-lg text-center text-gray-500 sm:text-left">Δεν βρέθηκαν κρατήσεις</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Animated Modal for Adding Subscription */}
      <AnimatePresence>
        {showAddSubsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={handleCloseAddSubsModal}
          >
            {/* Backdrop with blur and darkening */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.4 
              }}
              className="relative bg-white rounded-xl shadow-2xl p-6 min-w-[320px] max-w-[90vw] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.h3 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6 text-xl font-bold text-center text-gray-800"
              >
                Προσθήκη νέας συνδρομής
              </motion.h3>
              
              <motion.form 
                onSubmit={handleAddSubsSubmit} 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Τύπος Συνδρομής</label>
                  <select
                    name="subscription_model"
                    value={newSubs.subscription_model}
                    onChange={handleAddSubsChange}
                    required
                    className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Επιλέξτε τύπο</option>
                    {subscriptionTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Έναρξη</label>
                  <LocalizationProvider dateAdapter={AdapterDayjs} localeText={elGR.localeText}>
                    <DatePicker
                      value={newSubs.start_date ? dayjs(newSubs.start_date) : null}
                      onChange={(date) => {
                        if (date && date.isValid()) {
                          setNewSubs(prev => ({
                            ...prev,
                            start_date: date.format('YYYY-MM-DD')
                          }));
                        }
                      }}
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          variant: 'outlined',
                          required: true,
                          sx: {
                            backgroundColor: '#fff',
                            borderRadius: 2,
                            color: '#111',
                            fontWeight: 500,
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              background: '#fff',
                              color: '#111',
                              fontWeight: 500,
                              border: '1px solid #d1d5db',
                              '&:hover': {
                                border: '1px solid #10b981',
                              },
                              '&.Mui-focused': {
                                border: '2px solid #10b981',
                                boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)',
                              },
                            },
                            '& .MuiInputBase-input': {
                              color: '#111',
                              fontWeight: 500,
                              background: '#fff',
                              py: 1.5,
                              px: 2,
                            }
                          },
                        }
                      }}
                    />
                  </LocalizationProvider>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Λήξη</label>
                  <LocalizationProvider dateAdapter={AdapterDayjs} localeText={elGR.localeText}>
                    <DatePicker
                      value={newSubs.end_date ? dayjs(newSubs.end_date) : null}
                      onChange={(date) => {
                        if (date && date.isValid()) {
                          setNewSubs(prev => ({
                            ...prev,
                            end_date: date.format('YYYY-MM-DD')
                          }));
                        }
                      }}
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          variant: 'outlined',
                          required: true,
                          sx: {
                            backgroundColor: '#fff',
                            borderRadius: 2,
                            color: '#111',
                            fontWeight: 500,
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              background: '#fff',
                              color: '#111',
                              fontWeight: 500,
                              border: '1px solid #d1d5db',
                              '&:hover': {
                                border: '1px solid #10b981',
                              },
                              '&.Mui-focused': {
                                border: '2px solid #10b981',
                                boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.1)',
                              },
                            },
                            '& .MuiInputBase-input': {
                              color: '#111',
                              fontWeight: 500,
                              background: '#fff',
                              py: 1.5,
                              px: 2,
                            }
                          },
                        }
                      }}
                    />
                  </LocalizationProvider>
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Τιμή</label>
                  <input
                    name="price"
                    type="number"
                    value={newSubs.price}
                    onChange={handleAddSubsChange}
                    required
                    className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Κατάσταση Πληρωμής</label>
                  <select
                    name="payment_status"
                    value={newSubs.payment_status}
                    onChange={handleAddSubsChange}
                    required
                    className="w-full px-4 py-3 transition-all duration-200 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="Εκκρεμεί">Εκκρεμής</option>
                    <option value="Πληρωμένη">Πληρώθηκε</option>
                  </select>
                </div>
                
                {addSubsError && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3 text-sm text-center text-red-600 border border-red-200 rounded-lg bg-red-50"
                  >
                    {addSubsError}
                  </motion.div>
                )}
                
                <motion.div 
                  className="flex justify-end gap-3 pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button 
                    type="button" 
                    className="px-6 py-3 font-medium text-gray-700 transition-colors duration-200 bg-gray-100 rounded-lg hover:bg-gray-200"
                    onClick={handleCloseAddSubsModal} 
                    disabled={addSubsLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Άκυρο
                  </motion.button>
                  <motion.button 
                    type="submit" 
                    className="px-6 py-3 font-medium text-white transition-colors duration-200 bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={addSubsLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {addSubsLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Αποθήκευση...
                      </span>
                    ) : (
                      'Αποθήκευση'
                    )}
                  </motion.button>
                </motion.div>
              </motion.form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteSubsId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => setDeleteSubsId(null)}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                duration: 0.4 
              }}
              className="relative bg-white rounded-xl shadow-2xl p-6 min-w-[320px] max-w-[90vw] mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Επιβεβαίωση Διαγραφής
                </h3>
                <p className="mb-6 text-sm text-gray-500">
                  Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτή τη συνδρομή; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
                </p>
              </motion.div>
              
              <motion.div 
                className="flex justify-end gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.button 
                  type="button" 
                  className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 bg-gray-100 rounded-lg hover:bg-gray-200"
                  onClick={() => setDeleteSubsId(null)}
                  disabled={deleteSubsLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Άκυρο
                </motion.button>
                <motion.button 
                  type="button" 
                  className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleDeleteSubs(deleteSubsId)}
                  disabled={deleteSubsLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {deleteSubsLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Διαγραφή...
                    </span>
                  ) : (
                    'Διαγραφή'
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

