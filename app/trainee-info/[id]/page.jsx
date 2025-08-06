import axios from 'axios'
import TraineeInfo from './TraineeInfo'

// For development, return a hardcoded set of IDs to enable static site generation
export async function generateStaticParams() {
  // During development, return a static set of IDs including the one causing the error
  return [
    { id: '6a92a11b-589d-43e1-ba55-74105dad83a5' }
  ]
  
  // TODO: In production, fetch actual IDs:
  /*
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users`, { withCredentials: true })
    const trainees = response.data
    
    return trainees.map((trainee) => ({
      id: trainee.id.toString(),
    }))
  } catch (error) {
    console.error('Error fetching trainee IDs:', error)
    return [] 
  }
  */
}

export default function Page() {
  return <TraineeInfo />

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

  // Format date function (reused from your existing code)
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
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
              <h2 className="mb-4 text-2xl font-bold">Προσωπικές Πληροφορίες</h2>
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
                  <p className="text-sm text-gray-500">Κωδικός</p>
                  <p className="text-lg font-medium">{traineeData?.password || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ημερομηνία Εγγραφής</p>
                  <p className="text-lg font-medium">{formatDateDMY(traineeData?.created_at) || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Subscription */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
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
            </CardContent>
          </Card>

          {/* Subscription History */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
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
            </CardContent>
          </Card>

          {/* Bookings History */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-6">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
