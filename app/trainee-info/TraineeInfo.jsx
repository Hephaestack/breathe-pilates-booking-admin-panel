"use client"

import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { Button } from "../components/ui/button"
import { ArrowLeft } from 'lucide-react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { elGR } from '@mui/x-date-pickers/locales';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Fetcher function for SWR
const fetcher = url => axios.get(url, { withCredentials: true }).then(res => res.data)

export default function TraineeInfo({ id }) {
  const router = useRouter()
  const [subscriptionTypes, setSubscriptionTypes] = useState([])

  // Fetch trainee data and subscriptions first
  const { data: trainee, error: traineeError, isLoading: traineeLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
    fetcher
  )

  // Fetch trainee's subscriptions
  const { data: subscriptions, error: subsError, isLoading: subsLoading, mutate: mutateSubscriptions } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/${id}`,
    fetcher
  )

  // Fetch subscription types
  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions`, { withCredentials: true })
      .then(res => {
        if (Array.isArray(res.data)) setSubscriptionTypes(res.data)
        else if (res.data && Array.isArray(res.data.models)) setSubscriptionTypes(res.data.models)
        else setSubscriptionTypes([])
      })
      .catch(() => setSubscriptionTypes([]))
  }, [])

  // Debug subscriptions data
  console.log('Subscriptions Data:', subscriptions)
  console.log('Subscription Types:', subscriptionTypes)

  // Find active subscription early to use in subsequent hooks
  const activeSubscription = subscriptions?.find(sub => 
    new Date(sub.end_date) >= new Date()
  ) || subscriptions?.[0]

  // Debug active subscription
  console.log('Active Subscription:', activeSubscription)



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
        <div className="grid max-w-full gap-6">
          {/* Personal Information */}
          <div className="transition-shadow duration-200 bg-white border-2 border-gray-200 rounded-lg shadow-sm hover:shadow-md">
            <div className="p-4 sm:p-6">
              <h2 className="mb-4 text-xl font-bold text-center text-gray-800 sm:text-2xl sm:text-left">Προσωπικές Πληροφορίες</h2>
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
                  <p className="text-sm text-gray-500">Κωδικός</p>
                  <p className="text-lg font-medium">{traineeData?.password || '-'}</p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-500">Ημερομηνία Εγγραφής</p>
                  <p className="text-lg font-medium">{formatDateDMY(traineeData?.created_at) || '-'}</p>
                </div>
              </div>
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
              <h2 className="mb-4 text-xl font-bold text-center text-gray-800 sm:text-2xl sm:text-left">Ιστορικό Συνδρομών</h2>
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
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {subscriptions.map((sub, index) => (
                            <tr key={index} className="flex flex-col transition-colors duration-200 hover:bg-gray-50 lg:table-row">
                              <td className="px-3 py-4 text-sm font-medium text-center text-gray-900 border-b border-gray-200 whitespace-nowrap lg:border-b-0 lg:border-r">
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
                                      ${sub.payment_status === 'paid' 
                                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                                        : sub.payment_status === 'pending'
                                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                      }`}
                                    value={sub.payment_status || 'pending'}
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
                                    <option value="pending">Εκκρεμής</option>
                                    <option value="paid">Πληρώθηκε</option>
                                  </select>
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
              <h2 className="mb-4 text-2xl font-bold text-center sm:text-left">Ιστορικό Κρατήσεων</h2>
              {bookings && bookings.length > 0 ? (
                <div className="overflow-hidden border-2 border-gray-200 rounded-lg shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y-2 divide-gray-200">
                      <thead className="hidden lg:table-header-group bg-gray-50">
                        <tr>
                          <th scope="col" className="px-3 py-4 text-sm font-semibold text-center text-gray-900">Μάθημα</th>
                          <th scope="col" className="px-3 py-4 text-sm font-semibold text-center text-gray-900">Ημερομηνία</th>
                          <th scope="col" className="px-3 py-4 text-sm font-semibold text-center text-gray-900">Ώρα</th>
                          <th scope="col" className="px-3 py-4 text-sm font-semibold text-center text-gray-900">Κατάσταση</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map((booking) => {
                          const bookingDate = new Date(booking.date);
                          const formattedTime = bookingDate.toLocaleTimeString('el-GR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          });

                          return (
                            <tr key={booking.booking_id} className="flex flex-col hover:bg-gray-50 lg:table-row">
                              <td className="px-3 py-4 text-sm font-medium text-center text-gray-900 border-b border-gray-200 whitespace-nowrap lg:border-b-0 lg:border-r">
                                <div className="mb-1 font-semibold lg:hidden">Μάθημα:</div>
                                {booking.class_name}
                              </td>
                              <td className="px-3 py-4 text-sm text-center text-gray-500 border-b border-gray-200 whitespace-nowrap lg:border-b-0 lg:border-r">
                                <div className="mb-1 font-semibold lg:hidden">Ημερομηνία:</div>
                                {formatDateDMY(booking.date)}
                              </td>
                              <td className="px-3 py-4 text-sm text-center text-gray-500 border-b border-gray-200 whitespace-nowrap lg:border-b-0 lg:border-r">
                                <div className="mb-1 font-semibold lg:hidden">Ώρα:</div>
                                {formattedTime}
                              </td>
                              <td className="px-3 py-4 text-sm text-center text-gray-500 border-b whitespace-nowrap lg:border-b-0">
                                <div className="mb-1 font-semibold lg:hidden">Κατάσταση:</div>
                                <div className="flex justify-center lg:justify-start">
                                  <span className={`inline-flex px-2 py-1 text-sm rounded-full ${
                                    booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {booking.status === 'completed' ? 'Ολοκληρώθηκε' :
                                     booking.status === 'cancelled' ? 'Ακυρώθηκε' :
                                     'Προγραμματισμένο'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
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
    </div>
  );
}

