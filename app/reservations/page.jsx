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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white rounded-lg w-full max-w-2xl mx-4">
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
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          {/* Clients Table */}
          <div className="border border-gray-600 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Name</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-300">Action</th>
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <Button onClick={() => router.push("/admin-dashboard")} variant="outline" className="hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
          </div>

          <div className="flex items-center space-x-4">
            <input
              type="date"
              value="2025-06-18"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            />
            <Button className="bg-black hover:bg-gray-700 text-white">OK</Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6">
          <Button variant="default" size="sm" className="bg-black hover:bg-gray-700 text-white">
            All Classes
          </Button>
          <Button variant="outline" size="sm" className="hover:bg-gray-100 bg-transparent">
            Tower Level
          </Button>
          <Button variant="outline" size="sm" className="hover:bg-gray-100 bg-transparent">
            Cadillac Flow
          </Button>
          <Button variant="outline" size="sm" className="hover:bg-gray-100 bg-transparent">
            Private Sessions
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Statistics Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 font-medium">Date</div>
                  <div className="text-lg font-bold text-gray-900">{selectedDate}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-green-600 font-medium">Reservations</div>
                  <div className="text-lg font-bold text-green-900">{totalReservations}</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-sm text-red-600 font-medium">Cancellations</div>
                  <div className="text-lg font-bold text-red-900">{totalCancellations}</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-sm text-purple-600 font-medium">Total Classes</div>
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
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">From</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">To</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Class</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Reservations</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">On Hold</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">+</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">-</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-900">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reservationsData.map((reservation) => (
                        <tr key={reservation.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{reservation.timeFrom}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{reservation.timeTo}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{reservation.className}</td>

                          {/* Reservations Column - Clickable */}
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => handleReservationClick(reservation)}
                                className="w-12 h-8 rounded-lg flex items-center justify-center text-sm font-bold bg-green-100 border border-green-300 hover:bg-green-200 transition-colors cursor-pointer"
                              >
                                <span className={getCapacityColor(reservation.booked, reservation.capacity)}>
                                  {reservation.booked}/{reservation.capacity}
                                </span>
                              </button>
                            </div>
                          </td>

                          {/* On Hold Column */}
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-gray-400 flex items-center justify-center">
                                {reservation.onHold > 0 && (
                                  <span className="text-xs font-bold text-gray-700">{reservation.onHold}</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Plus Button */}
                          <td className="px-4 py-3 text-center">
                            <Button size="sm" className="w-8 h-8 p-0 bg-green-600 hover:bg-green-700 rounded-full">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </td>

                          {/* Minus Button */}
                          <td className="px-4 py-3 text-center">
                            <Button size="sm" variant="destructive" className="w-8 h-8 p-0 rounded-full">
                              <Minus className="w-4 h-4" />
                            </Button>
                          </td>

                          {/* Delete Button */}
                          <td className="px-4 py-3 text-center">
                            <Button size="sm" variant="destructive" className="text-xs px-2">
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
