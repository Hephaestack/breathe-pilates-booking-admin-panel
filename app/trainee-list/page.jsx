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
import Link from "next/link";


import { useEffect } from "react"

export default function TraineePage() {
  const router = useRouter()
  const [trainees, setTrainees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("list")

useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`)
    .then((res) => res.json())
    .then((data) => {
      // Robust: always set an array
      let users = [];
      if (Array.isArray(data)) {
        users = data;
      } else if (data && Array.isArray(data.users)) {
        users = data.users;
      }
      setTrainees(users);
      setLoading(false);
    })
    .catch((err) => {
      console.error('Error fetching users:', err);
      setTrainees([]);
      setLoading(false);
    });
}, [])

  const filteredTrainees = trainees.filter(
    (trainer) =>
      trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainer.phone.includes(searchTerm) ||
      ((trainer.address?.city || "").toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-2 bg-gray-50 sm:p-4">
      <div className="mx-auto max-w-7xl">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            onClick={() => router.push("/admin-dashboard")}
            variant="outline"
            className="w-full bg-white border hover:bg-gray-100 sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <Card className="mb-6 bg-white border shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-semibold text-black">Trainers</h1>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">
                <Button variant="outline" size="sm" className="w-full bg-white border hover:bg-gray-100 sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
                 <Link href="/add-trainee">
                <Button size="sm" className="w-full text-white bg-black hover:bg-gray-800 sm:w-auto">
                 
                  <Plus className="w-4 h-4 mr-2" />
                  Add Trainee
                </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="mb-6 bg-white border shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-4">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 bg-white border sm:w-64"
                  />
                </div>
                <select className="w-full px-3 py-2 text-black bg-white border rounded sm:w-auto">
                  <option>All</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
                <select className="w-full px-3 py-2 text-black bg-white border rounded sm:w-auto">
                  <option>Category</option>
                </select>
                <select className="w-full px-3 py-2 text-black bg-white border rounded sm:w-auto">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <Button size="sm" className="w-full text-white bg-black hover:bg-gray-800 sm:w-auto">
                  Search
                </Button>
              </div>

              <div className="flex flex-row gap-2 sm:items-center sm:space-x-2">
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
        <div className="mb-4 text-center text-gray-500">Page 1 of 1 - {filteredTrainees.length} records</div>

        {/* Data Table */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="text-black">Όνομα</TableHead>
                    <TableHead className="text-black">Πόλη</TableHead>
                    <TableHead className="text-black">Φύλο</TableHead>
                    <TableHead className="text-black">Mobile Phone</TableHead>
                    <TableHead className="text-black">Status</TableHead>
                    <TableHead className="text-black">Subscription Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrainees.map((trainer) => {
                    let status = "-";
                    let phone = "-";
                    let expires = "-";
                    if (trainer.subscription_expires) {
                      const today = new Date().toISOString().slice(0, 10);
                      if (trainer.subscription_expires >= today) status = "Active";
                      else status = "Inactive";
                      expires = trainer.subscription_expires;
                    }
                    if (trainer.phone) phone = trainer.phone;
                    return (
                      <TableRow key={trainer.id} className="transition-colors duration-150 border-b hover:bg-gray-50">
                        <TableCell className="flex items-center space-x-3 py-3 px-2 min-w-[120px]">
                          <Avatar className="w-8 h-8 min-w-8 min-h-8">
                            <AvatarFallback className="text-xs text-white bg-black">
                              {trainer.name
                                ? trainer.name.split(" ").map((n) => n[0]).join("")
                                : "-"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-black font-medium truncate max-w-[120px]">{trainer.name || "-"}</span>
                        </TableCell>
                        <TableCell className="text-black py-3 px-2 min-w-[80px]">{trainer.address?.city || "-"}</TableCell>
                        <TableCell className="text-black py-3 px-2 min-w-[80px]">{trainer.gender || "-"}</TableCell>
                        <TableCell className="text-black py-3 px-2 min-w-[120px]">{phone}</TableCell>
                        <TableCell className="text-black py-3 px-2 min-w-[80px]">
                          <span className={status === "Active" ? "text-green-600 font-bold" : status === "Inactive" ? "text-red-600 font-bold" : "text-gray-400"}>{status}</span>
                        </TableCell>
                        <TableCell className="text-black py-3 px-2 min-w-[120px]">{expires}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex justify-center mt-6">
          <Button variant="outline" size="sm" className="w-full bg-white border hover:bg-gray-100 sm:w-auto">
            →
          </Button>
        </div>
      </div>
    </div>
  )
}
