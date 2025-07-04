"use client"

import { useState } from "react"
import { ArrowLeft, Calendar, Plus, Minus, X, Printer } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { useRouter } from "next/navigation"

// Sample reservations data with client names
const reservationsData = [
  {
    id: 1,
    timeFrom: "09:30",
    timeTo: "10:30",
    className: "TOWER LEVEL 2",
    capacity: 10,
    booked: 2,
    onHold: 0,
    clients: ["Maria Tsiriki", "Marina Tsantila"],
  },
  {
    id: 2,
    timeFrom: "10:30",
    timeTo: "11:30",
    className: "TOWER LEVEL 3",
    capacity: 8,
    booked: 3,
    onHold: 1,
    clients: ["Olga Marinou", "Antigona Tsiriki", "Efi Papaioannou"],
  },
  {
    id: 3,
    timeFrom: "10:30",
    timeTo: "11:30",
    className: "CADILLAC FLOW",
    capacity: 6,
    booked: 2,
    onHold: 0,
    clients: ["Georgia Michalarou", "Angeliki Vaiakopoylou"],
  },
  {
    id: 4,
    timeFrom: "11:30",
    timeTo: "12:30",
    className: "TOWER LEVEL 1",
    capacity: 12,
    booked: 4,
    onHold: 2,
    clients: ["Georgia Michalarou", "Angeliki Vaiakopoylou", "Rea Pantou", "Afroditi Velissari"],
  },
  {
    id: 5,
    timeFrom: "16:00",
    timeTo: "17:00",
    className: "TOWER LEVEL 2",
    capacity: 10,
    booked: 3,
    onHold: 1,
    clients: ["Maria Tsiriki", "Olga Marinou", "Efi Papaioannou"],
  },
  {
    id: 6,
    timeFrom: "16:00",
    timeTo: "17:00",
    className: "CADILLAC FLOW",
    capacity: 6,
    booked: 0,
    onHold: 0,
    clients: [],
  },
  {
    id: 7,
    timeFrom: "17:00",
    timeTo: "18:00",
    className: "TOWER LEVEL 1",
    capacity: 12,
    booked: 5,
    onHold: 1,
    clients: ["Marina Tsantila", "Antigona Tsiriki", "Georgia Michalarou", "Rea Pantou", "Afroditi Velissari"],
  },
  {
    id: 8,
    timeFrom: "17:00",
    timeTo: "18:00",
    className: "CADILLAC FLOW",
    capacity: 6,
    booked: 1,
    onHold: 0,
    clients: ["Angeliki Vaiakopoylou"],
  },
  {
    id: 9,
    timeFrom: "18:00",
    timeTo: "19:00",
    className: "TOWER LEVEL 2",
    capacity: 10,
    booked: 2,
    onHold: 1,
    clients: ["Maria Tsiriki", "Efi Papaioannou"],
  },
  {
    id: 10,
    timeFrom: "18:00",
    timeTo: "19:00",
    className: "CADILLAC FLOW",
    capacity: 6,
    booked: 1,
    onHold: 0,
    clients: ["Olga Marinou"],
  },
]

// Reservations Modal Component
function ReservationsModal({ isOpen, onClose, reservation }) {
  if (!isOpen || !reservation) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl mx-4 text-white bg-gray-800 rounded-lg">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h2 className="text-lg font-semibold">Reservations</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Class Details */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-gray-300">
                  <span className="font-medium">Class:</span> {reservation.className}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Date:</span> 03/07/2025
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Time:</span> {reservation.timeFrom} - {reservation.timeTo}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Reservations:</span> {reservation.booked}
                </p>
              </div>
              <Button className="text-white bg-green-600 hover:bg-green-700">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          {/* Clients Table */}
          <div className="overflow-hidden border border-gray-600 rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-left text-gray-300">Name</th>
                  <th className="px-4 py-3 text-sm font-medium text-center text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-600">
                {reservation.clients.length > 0 ? (
                  reservation.clients.map((client, index) => (
                    <tr key={index} className="hover:bg-gray-700">
                      <td className="px-4 py-3 text-sm text-gray-200">{client}</td>
                      <td className="px-4 py-3 text-center">
                        <Button size="sm" variant="destructive" className="text-xs">
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="px-4 py-8 text-center text-gray-400">
                      No reservations for this class
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReservationsPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState("18/06/2025")
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Calculate statistics
  const totalReservations = reservationsData.reduce((sum, item) => sum + item.booked, 0)
  const totalCancellations = 12 // Mock data
  const totalClasses = reservationsData.length

  const getCapacityColor = (booked, capacity) => {
    const percentage = (booked / capacity) * 100
    if (percentage >= 80) return "text-red-600 font-semibold"
    if (percentage >= 50) return "text-yellow-600 font-semibold"
    return "text-green-600 font-semibold"
  }

  const handleReservationClick = (reservation) => {
    setSelectedReservation(reservation)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedReservation(null)
  }

  return (
    <div className="min-h-screen p-2 bg-gray-50 sm:p-4">
      <div className="mx-auto max-w-7xl">
        {/* Back Button */}
        <div className="mb-4">
          <Button onClick={() => router.push("/admin-panel")} variant="outline" className="w-full hover:bg-gray-100 sm:w-auto">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-black rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-4">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black sm:w-auto"
            />
            <Button className="w-full text-white bg-black hover:bg-gray-700 sm:w-auto">OK</Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="default" size="sm" className="w-full text-white bg-black hover:bg-gray-700 sm:w-auto">
            All Classes
          </Button>
          <Button variant="outline" size="sm" className="w-full bg-transparent hover:bg-gray-100 sm:w-auto">
            Tower Level
          </Button>
          <Button variant="outline" size="sm" className="w-full bg-transparent hover:bg-gray-100 sm:w-auto">
            Cadillac Flow
          </Button>
          <Button variant="outline" size="sm" className="w-full bg-transparent hover:bg-gray-100 sm:w-auto">
            Private Sessions
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Statistics Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="text-sm font-medium text-gray-600">Date</div>
                  <div className="text-lg font-bold text-gray-900">{selectedDate}</div>
                </div>
                <div className="p-3 border border-green-200 rounded-lg bg-green-50">
                  <div className="text-sm font-medium text-green-600">Reservations</div>
                  <div className="text-lg font-bold text-green-900">{totalReservations}</div>
                </div>
                {/* <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                  <div className="text-sm font-medium text-red-600">Cancellations</div>
                  <div className="text-lg font-bold text-red-900">{totalCancellations}</div>
                </div> */}
                <div className="p-3 border border-purple-200 rounded-lg bg-purple-50">
                  <div className="text-sm font-medium text-purple-600">Total Classes</div>
                  <div className="text-lg font-bold text-purple-900">{totalClasses}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Reservations Table */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-sm font-medium text-left text-gray-900">From</th>
                        <th className="px-4 py-3 text-sm font-medium text-left text-gray-900">Class</th>
                        <th className="px-4 py-3 text-sm font-medium text-center text-gray-900">Reservations</th>
                        <th className="px-4 py-3 text-sm font-medium text-center text-gray-900">+</th>
                        <th className="px-4 py-3 text-sm font-medium text-center text-gray-900">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reservationsData.map((reservation) => (
                        <tr key={reservation.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{reservation.timeFrom}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{reservation.className}</td>
                          {/* Reservations Column - Clickable */}
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => handleReservationClick(reservation)}
                                className="flex items-center justify-center w-12 h-8 text-sm font-bold transition-colors bg-green-100 border border-green-300 rounded-lg cursor-pointer hover:bg-green-200"
                              >
                                <span className={getCapacityColor(reservation.booked, reservation.capacity)}>
                                  {reservation.booked}/{reservation.capacity}
                                </span>
                              </button>
                            </div>
                          </td>
                          {/* Plus Button */}
                          <td className="px-4 py-3 text-center">
                            <Button size="sm" className="w-8 h-8 p-0 bg-green-600 rounded-full hover:bg-green-700">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </td>
                          {/* Delete Button */}
                          <td className="px-4 py-3 text-center">
                            <Button size="sm" variant="destructive" className="px-2 text-xs">
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reservations Modal */}
        <ReservationsModal isOpen={isModalOpen} onClose={closeModal} reservation={selectedReservation} />
      </div>
    </div>
  )
}
