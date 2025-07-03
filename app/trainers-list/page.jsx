"use client"

import { useState } from "react"
import { Search, Download, Plus, List, Grid, ArrowLeft } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { useRouter } from "next/navigation"

// Sample trainer data
const trainersData = [
  {
    id: 1,
    name: "Maria Tsiriki",
    phone: "6946820126",
    address: "Loutra",
    email: "maria@example.com",
    balance: "0.00 €",
    date: "01/08/2025",
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Marina Tsantila",
    phone: "6944041761",
    address: "",
    email: "marina@example.com",
    balance: "0.00 €",
    date: "31/07/2025",
    status: "ACTIVE",
  },
  {
    id: 3,
    name: "Olga Marinou",
    phone: "6973864431",
    address: "Klenia",
    email: "olga@example.com",
    balance: "0.00 €",
    date: "31/07/2025",
    status: "ACTIVE",
  },
  {
    id: 4,
    name: "Antigona Tsiriki",
    phone: "6959997838",
    address: "Loutra",
    email: "antigona@example.com",
    balance: "0.00 €",
    date: "29/07/2025",
    status: "ACTIVE",
  },
  {
    id: 5,
    name: "Efi Papaioannou",
    phone: "6975100052",
    address: "Korinthos",
    email: "efi@example.com",
    balance: "0.00 €",
    date: "31/07/2025",
    status: "ACTIVE",
  },
]

export default function TrainersPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("list")

  const filteredTrainers = trainersData.filter(
    (trainer) =>
      trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.phone.includes(searchTerm) ||
      trainer.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            onClick={() => router.push("/admin-dashboard")}
            variant="outline"
            className="bg-white border hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <Card className="bg-white border shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-semibold text-black">Trainers</h1>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="bg-white border hover:bg-gray-100">
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
                <Button size="sm" className="bg-black text-white hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Trainer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="bg-white border shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border w-64"
                  />
                </div>
                <select className="bg-white border rounded px-3 py-2 text-black">
                  <option>All</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
                <select className="bg-white border rounded px-3 py-2 text-black">
                  <option>Category</option>
                </select>
                <select className="bg-white border rounded px-3 py-2 text-black">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <Button size="sm" className="bg-black text-white hover:bg-gray-800">
                  Search
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={
                    viewMode === "list" ? "bg-black text-white hover:bg-gray-800" : "bg-white border hover:bg-gray-100"
                  }
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={
                    viewMode === "grid" ? "bg-black text-white hover:bg-gray-800" : "bg-white border hover:bg-gray-100"
                  }
                >
                  <Grid className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="text-center text-gray-500 mb-4">Page 1 of 24 - 10 out of 237 records</div>

        {/* Data Table */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="text-black">Name</TableHead>
                  <TableHead className="text-black">Mobile Phone</TableHead>
                  <TableHead className="text-black">Address</TableHead>
                  <TableHead className="text-black">Member Card</TableHead>
                  <TableHead className="text-black">E-mail</TableHead>
                  <TableHead className="text-black">Balance</TableHead>
                  <TableHead className="text-black">Date</TableHead>
                  <TableHead className="text-black">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrainers.map((trainer) => (
                  <TableRow key={trainer.id} className="border-b hover:bg-gray-50">
                    <TableCell className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-black text-white text-xs">
                          {trainer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-black">{trainer.name}</span>
                    </TableCell>
                    <TableCell className="text-black">{trainer.phone}</TableCell>
                    <TableCell className="text-black">{trainer.address}</TableCell>
                    <TableCell className="text-black">-</TableCell>
                    <TableCell className="text-black">{trainer.email}</TableCell>
                    <TableCell className="text-black">{trainer.balance}</TableCell>
                    <TableCell className="text-black">{trainer.date}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-black text-white">
                        {trainer.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex justify-center mt-6">
          <Button variant="outline" size="sm" className="bg-white border hover:bg-gray-100">
            →
          </Button>
        </div>
      </div>
    </div>
  )
}
