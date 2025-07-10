"use client"

import { useState, useEffect } from "react"
import { Search, Download, Plus, List, Grid, ArrowLeft, Trash2 } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent } from "../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { useRouter } from "next/navigation"
import Link from "next/link";
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"

export default function TraineePage() {
  const router = useRouter()
  const [trainees, setTrainees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("list")
  const [deleteModal, setDeleteModal] = useState({ open: false, trainee: null })
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
      withCredentials: true,
    })
      .then((res) => {
        let data = res.data;
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
    (trainee) => {
      if (!trainee.name) return false;
      // Loose search: ignore accents, case, and allow partial matches anywhere
      const normalize = (str) => str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
      const search = normalize(searchTerm.trim());
      const name = normalize(trainee.name);
      return search.split(' ').every(word => name.includes(word));
    }
  )

  const handleDelete = async (trainee) => {
    setDeleting(true)
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${trainee.id}`, { withCredentials: true })
      setTrainees((prev) => prev.filter((t) => t.id !== trainee.id))
      setDeleteModal({ open: false, trainee: null })
    } catch (err) {
      alert("Σφάλμα διαγραφής χρήστη.")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <>
      {/* Main content, blur only when modal is open */}
      <div className={deleteModal.open ? "min-h-screen p-2 bg-gray-50 sm:p-4 filter blur-sm" : "min-h-screen p-2 bg-gray-50 sm:p-4"}>
        <div className="mx-auto max-w-7xl">
          {/* Κουμπί Επιστροφής */}
          <div className="mb-4">
            <Button
              onClick={() => router.push("/admin-panel")}
              variant="outline"
              className="w-full bg-white border-[#bbbbbb] hover:bg-gray-100 sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Επιστροφή στον Πίνακα Ελέγχου
            </Button>
          </div>

          {/* Επικεφαλίδα */}
          <Card className="mb-6 bg-white shadow-sm shadow-black">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center gap-4">
                <h1 className="mb-2 text-2xl font-bold tracking-tight text-center text-black">Μαθητές</h1>
                <div className="flex flex-row justify-center w-full max-w-sm gap-3">
                  <Button variant="outline" size="sm" className="flex-1 bg-white border-[#bbbbbb] hover:bg-gray-100">
                    <Download className="w-4 h-4 mr-2" />
                    Εξαγωγή Excel
                  </Button>
                  <Link href="/add-trainee" className="flex-1">
                    <Button size="sm" className="w-full text-white bg-black hover:bg-gray-800">
                      <Plus className="w-4 h-4 mr-2" />
                      Προσθήκη Μαθητή
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Αναζήτηση */}
          <div className="flex items-center justify-between w-full mx-auto mb-4 max-w-7xl">
            <div className="relative w-full max-w-xs">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <Input
                placeholder="Αναζήτηση μαθητή με όνομα..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 bg-white border border-[#bbbbbb]"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                aria-label="Προβολή Πίνακα"
                className={viewMode === 'list' ? 'bg-black text-white' : 'bg-white border-[#bbbbbb]'}
                onClick={() => setViewMode('list')}
              >
                <List className="w-5 h-5" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                aria-label="Προβολή Καρτών"
                className={viewMode === 'grid' ? 'bg-black text-white' : 'bg-white border-[#bbbbbb]'}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Προβολή Δεδομένων */}
          {viewMode === 'list' ? (
            <Card className="bg-white border-[#bbbbbb] shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow className="border-b border-[#bbbbbb]">
                        <TableHead className="text-lg font-extrabold text-black">Όνομα</TableHead>
                        <TableHead className="text-lg font-extrabold text-black">Πόλη</TableHead>
                        <TableHead className="text-lg font-extrabold text-black">Φύλο</TableHead>
                        <TableHead className="text-lg font-extrabold text-black">Κινητό</TableHead>
                        <TableHead className="text-lg font-extrabold text-black">Κατάσταση</TableHead>
                        <TableHead className="text-lg font-extrabold text-black">Λήξη Συνδρομής</TableHead>
                        <TableHead className="text-lg font-extrabold text-black"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTrainees.map((trainee) => {
                        let katastasi = "-";
                        let kinito = "-";
                        let lixi = "-";
                        if (trainee.subscription_expires) {
                          const simera = new Date().toISOString().slice(0, 10);
                          if (trainee.subscription_expires >= simera) katastasi = "Ενεργή";
                          else katastasi = "Ανενεργή";
                          lixi = trainee.subscription_expires;
                        }
                        if (trainee.phone) kinito = trainee.phone;
                        return (
                          <TableRow key={trainee.id} className="transition-colors duration-150 border-b border-[#bbbbbb] hover:bg-gray-50">
                            <TableCell className="py-3 px-2 min-w-[120px] text-center">
                              <div className="flex flex-col items-center justify-center">
                                <Avatar className="w-8 h-8 mb-1 min-w-8 min-h-8">
                                  <AvatarFallback className="text-xs text-white bg-black">
                                    {trainee.name
                                      ? trainee.name.split(" ").map((n) => n[0]).join("")
                                      : "-"}
                                  </AvatarFallback>
                                </Avatar>
                                {/* Όνομα */}
                                <span className="text-black font-medium truncate max-w-[180px]">
                                  {trainee.name && trainee.name.split(" ")[0] ? trainee.name.split(" ")[0] : "-"}
                                </span>
                                {/* Επώνυμο (αν υπάρχει) */}
                                <span className="text-gray-600 text-sm truncate max-w-[180px]">
                                  {trainee.name && trainee.name.split(" ").length > 1 ? trainee.name.split(" ").slice(1).join(" ") : ""}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-black py-3 px-2 min-w-[80px]">{trainee.city || "-"}</TableCell>
                            <TableCell className="text-black py-3 px-2 min-w-[80px]">{trainee.gender || "-"}</TableCell>
                            <TableCell className="text-black py-3 px-2 min-w-[120px]">{kinito}</TableCell>
                            <TableCell className="text-black py-3 px-2 min-w-[80px]">
                              <span className={katastasi === "Ενεργή" ? "text-green-600 font-bold" : katastasi === "Ανενεργή" ? "text-red-600 font-bold" : "text-gray-400"}>{katastasi}</span>
                            </TableCell>
                            <TableCell className="text-black py-3 px-2 min-w-[120px]">{lixi}</TableCell>
                            <TableCell className="py-3 px-2 min-w-[80px] text-center">
                              <Button variant="destructive" size="icon" onClick={() => setDeleteModal({ open: true, trainee })}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredTrainees.map((trainee) => {
                let katastasi = "-";
                let kinito = "-";
                let lixi = "-";
                if (trainee.subscription_expires) {
                  const simera = new Date().toISOString().slice(0, 10);
                  if (trainee.subscription_expires >= simera) katastasi = "Ενεργή";
                  else katastasi = "Ανενεργή";
                  lixi = trainee.subscription_expires;
                }
                if (trainee.phone) kinito = trainee.phone;
                return (
                  <Card key={trainee.id} className="bg-white border-[#bbbbbb] shadow-sm flex flex-col items-center p-4">
                    <Avatar className="w-12 h-12 mb-2">
                      <AvatarFallback className="text-base text-white bg-black">
                        {trainee.name
                          ? trainee.name.split(" ").map((n) => n[0]).join("")
                          : "-"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-lg font-semibold text-center text-black">
                      {trainee.name || "-"}
                    </div>
                    <div className="mb-2 text-sm text-center text-gray-600">
                      {trainee.city || "-"} • {trainee.gender || "-"}
                    </div>
                    <div className="mb-1 text-sm text-black">
                      <span className="font-medium">Κινητό:</span> {kinito}
                    </div>
                    <div className="mb-1 text-sm text-black">
                      <span className="font-medium">Κατάσταση:</span> <span className={katastasi === "Ενεργή" ? "text-green-600 font-bold" : katastasi === "Ανενεργή" ? "text-red-600 font-bold" : "text-gray-400"}>{katastasi}</span>
                    </div>
                    <div className="text-sm text-black">
                      <span className="font-medium">Λήξη:</span> {lixi}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Πληροφορίες Αποτελεσμάτων */}
          <div className="mt-8 mb-4 text-center text-gray-500">Σελίδα 1 από 1 - {filteredTrainees.length} εγγραφές</div>

          {/* Pagination */}
          <div className="flex justify-center mt-6">
            <Button variant="outline" size="sm" className="w-full bg-white border-[#bbbbbb] hover:bg-gray-100 sm:w-auto">
              →
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Διαγραφής - OUTSIDE the blurred content */}
      <AnimatePresence>
        {deleteModal.open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex flex-col items-center w-full max-w-sm p-8 bg-white rounded-lg shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <h2 className="mb-2 text-lg font-bold text-center">Διαγραφή Μαθητή</h2>
              <p className="mb-4 text-center">Είστε σίγουροι ότι θέλετε να διαγράψετε τον/την <span className="font-semibold">{deleteModal.trainee?.name}</span>;</p>
              <div className="flex justify-center w-full gap-4">
                <Button variant="outline" onClick={() => setDeleteModal({ open: false, trainee: null })} disabled={deleting}>
                  Ακύρωση
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(deleteModal.trainee)} disabled={deleting}>
                  {deleting ? "Διαγραφή..." : "Διαγραφή"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
