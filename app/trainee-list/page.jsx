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
import { Listbox } from '@headlessui/react'
import { useEffect as useBodyModalEffect } from "react";

function useBodyModalOpen(isOpen) {
  useBodyModalEffect(() => {
    if (typeof document !== 'undefined') {
      if (isOpen) {
        document.body.classList.add('modal-open');
      } else {
        document.body.classList.remove('modal-open');
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('modal-open');
      }
    };
  }, [isOpen]);
}


export default function TraineePage() {
  const router = useRouter()
  const [trainees, setTrainees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("list")
  const [deleteModal, setDeleteModal] = useState({ open: false, trainee: null })
  const [deleting, setDeleting] = useState(false)
  // Edit modal state
  const [editModal, setEditModal] = useState({ open: false, trainee: null })
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    city: '',
    gender: '',
    subscription_model: '',
    package_total: '',
    subscription_starts: '',
    subscription_expires: '',
    remaining_classes: '',
  })

  const packageTotalMap = {
    'πακέτο 10': 10,
    'πακέτο 15': 15,
    'πακέτο 20': 20,
    'πακέτο 4 yoga': 4,
    'πακέτο cadillac 5': 5,
    'πακέτο cadillac 10': 10,
  };
  const [updating, setUpdating] = useState(false)
  // Subscription models from backend
  const [subscriptionModels, setSubscriptionModels] = useState([])

  // Pagination state
  const USERS_PER_PAGE = 10;
  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState(0); // -1 for prev, 1 for next

  // Prevent page shift when modal is open (must be after state declarations)
  useBodyModalOpen(deleteModal.open || editModal.open);

  // No global scrollbar on html/body; only on blurred wrapper

  useEffect(() => {
    // Fetch subscription models from backend (correct endpoint)
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions`, { withCredentials: true })
      .then(res => {
        if (Array.isArray(res.data)) setSubscriptionModels(res.data)
        else if (res.data && Array.isArray(res.data.models)) setSubscriptionModels(res.data.models)
        else setSubscriptionModels([])
      })
      .catch(() => setSubscriptionModels([]))
  }, [])

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
        // Sort by created_at descending (most recent first)
        users.sort((a, b) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bTime - aTime;
        });
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
  );

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredTrainees.length / USERS_PER_PAGE));
  const paginatedTrainees = filteredTrainees.slice((page - 1) * USERS_PER_PAGE, page * USERS_PER_PAGE);


  const handleEdit = (trainee) => {
    let genderValue = '';
    if (trainee.gender === 'Άνδρας' || trainee.gender === 'Γυναίκα') {
      genderValue = trainee.gender;
    } else if (typeof trainee.gender === 'boolean') {
      genderValue = trainee.gender ? 'Άνδρας' : 'Γυναίκα';
    } else {
      genderValue = trainee.gender || '';
    }
    // Always fetch latest remaining_classes and package_total for this trainee
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${trainee.id}`, { withCredentials: true })
      .then(res => {
        const user = res.data && res.data.id ? res.data : (res.data && res.data.user ? res.data.user : trainee);
        setEditForm({
          name: user.name || '',
          phone: user.phone || '',
          city: user.city || '',
          gender: genderValue,
          subscription_model: user.subscription_model || '',
          package_total: user.package_total || '',
          subscription_starts: user.subscription_starts || '',
          subscription_expires: user.subscription_expires || '',
          remaining_classes: user.remaining_classes || '',
        });
        setEditModal({ open: true, trainee });
      })
      .catch(() => {
        setEditForm({
          name: trainee.name || '',
          phone: trainee.phone || '',
          city: trainee.city || '',
          gender: genderValue,
          subscription_model: trainee.subscription_model || '',
          package_total: trainee.package_total || '',
          subscription_starts: trainee.subscription_starts || '',
          subscription_expires: trainee.subscription_expires || '',
          remaining_classes: trainee.remaining_classes || '',
        });
        setEditModal({ open: true, trainee });
      });
  }

  // Handle form field change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    // If changing subscription_model and it's a package, set package_total automatically
    if (name === 'subscription_model') {
      let newForm = { ...editForm, [name]: value };
      const key = value ? value.trim().toLowerCase() : '';
      if (key && key.includes('πακέτο')) {
        // Find the correct key in the map (case-insensitive)
        const found = Object.keys(packageTotalMap).find(k => k.toLowerCase() === key);
        if (found) {
          newForm.package_total = packageTotalMap[found];
        } else {
          newForm.package_total = '';
        }
      } else {
        newForm.package_total = '';
      }
      setEditForm(newForm);
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Submit edit
  const handleEditSubmit = async () => {
    setUpdating(true)
    try {
      const id = editModal.trainee.id;
      // Prepare form data: send null (or omit) for empty integer fields
      const dataToSend = { ...editForm };
      // For package subscriptions, these are numbers or null
      if (dataToSend.package_total === '' || dataToSend.package_total === undefined) {
        dataToSend.package_total = null;
      }
      if (dataToSend.remaining_classes === '' || dataToSend.remaining_classes === undefined) {
        dataToSend.remaining_classes = null;
      }
      // If not a package, also null these fields
      if (!dataToSend.subscription_model || !dataToSend.subscription_model.toLowerCase().includes('πακέτο')) {
        dataToSend.package_total = null;
        dataToSend.remaining_classes = null;
      }
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${id}`, dataToSend, { withCredentials: true })
      // Update local state
      setTrainees((prev) => prev.map((t) => t.id === id ? { ...t, ...editForm, ...dataToSend } : t))
      setEditModal({ open: false, trainee: null })
    } catch (err) {
      alert("Σφάλμα ενημέρωσης χρήστη.")
    } finally {
      setUpdating(false)
    }
  }

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
      <div className={deleteModal.open ? "min-h-screen p-2 bg-gray-50 sm:p-4 filter blur-sm fixed inset-0 w-full overflow-y-auto" : "min-h-screen p-2 bg-gray-50 sm:p-4"}>
        <div className="mx-auto max-w-7xl">
          {/* Κουμπί Επιστροφής */}
          <div className="mb-4">
            <Button
              onClick={() => router.push("/admin-panel")}
              variant="outline"
              className="w-full bg-black text-white  border-[#bbbbbb] hover:bg-gray-800 hover:text-white sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Επιστροφή στον Πίνακα Διαχείρισης
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
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
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
                  <motion.div
                    key={page}
                    initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
                    transition={{ duration: 0.35, type: 'tween' }}
                  >
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
                        {paginatedTrainees.map((trainee) => {
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
                              <div className="flex justify-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => handleEdit(trainee)}>
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 019 17H7v-2a2 2 0 01.586-1.414z" /></svg>
                                </Button>
                                <Button variant="destructive" size="icon" onClick={() => setDeleteModal({ open: true, trainee })}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              key={page}
              initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
              transition={{ duration: 0.35, type: 'tween' }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            >
              {paginatedTrainees.map((trainee) => {
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
                    {/* Edit/Delete Buttons */}
                    <div className="flex justify-center gap-2 mt-3">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(trainee)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 019 17H7v-2a2 2 0 01.586-1.414z" /></svg>
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => setDeleteModal({ open: true, trainee })}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </motion.div>
          )}

          {/* Πληροφορίες Αποτελεσμάτων */}
          <div className="mt-8 mb-4 text-center text-gray-500">
            Σελίδα {page} από {totalPages} - {filteredTrainees.length} εγγραφές
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-[#bbbbbb] hover:bg-gray-100"
              disabled={page === 1}
              onClick={() => { setDirection(-1); setPage(p => Math.max(1, p - 1)); }}
            >
              ← Προηγούμενη
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-[#bbbbbb] hover:bg-gray-100"
              disabled={page === totalPages}
              onClick={() => { setDirection(1); setPage(p => Math.min(totalPages, p + 1)); }}
            >
              Επόμενη →
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

      {/* Modal Επεξεργασίας */}
      <AnimatePresence>
        {editModal.open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex flex-col items-center w-full max-w-md p-8 bg-white rounded-lg shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <h2 className="mb-2 text-lg font-bold text-center">Επεξεργασία Μαθητή</h2>
              <form className="w-full space-y-3" onSubmit={e => { e.preventDefault(); handleEditSubmit(); }}>
                <div>
                  <label className="block mb-1 text-sm font-medium">Όνομα</label>
                  <Input name="name" value={editForm.name} onChange={handleEditFormChange} className="border border-black" />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Κινητό</label>
                  <Input name="phone" value={editForm.phone} onChange={handleEditFormChange} className="border border-black" />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Πόλη</label>
                  <Input name="city" value={editForm.city} onChange={handleEditFormChange} className="border border-black" />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Φύλο</label>
                  <SelectDropdown
                    name="gender"
                    value={editForm.gender}
                    onChange={handleEditFormChange}
                    options={[
                      { value: '', label: '-' },
                      { value: 'male', label: 'Άνδρας' },
                      { value: 'female', label: 'Γυναίκα' },
                    ]}
                    placeholder="Φύλο"
                    disabled={updating}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Τύπος Συνδρομής</label>
                  <SelectDropdown
                    name="subscription_model"
                    value={editForm.subscription_model}
                    onChange={handleEditFormChange}
                    options={[
                      { value: '', label: '-' },
                      ...((Array.isArray(subscriptionModels) ? subscriptionModels : []).map(model => ({ value: model, label: model })))
                    ]}
                    placeholder="Τύπος Συνδρομής"
                    disabled={updating}
                  />
                </div>
                {/* Show only if model is a "πακέτο" (package) */}
                {(editForm.subscription_model && editForm.subscription_model.toLowerCase().includes('πακέτο')) || (editForm.package_total || editForm.remaining_classes) ? (
                  <>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Σύνολο Πακέτου</label>
                      <Input name="package_total" type="number" value={editForm.package_total} readOnly className="bg-gray-100 border border-black cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium">Υπόλοιπες Συνεδρίες</label>
                      <Input name="remaining_classes" type="number" value={editForm.remaining_classes} readOnly className="bg-gray-100 border border-black cursor-not-allowed" />
                    </div>
                  </>
                ) : null}
                <div>
                  <label className="block mb-1 text-sm font-medium">Έναρξη Συνδρομής</label>
                  <Input name="subscription_starts" type="date" value={editForm.subscription_starts} onChange={handleEditFormChange} className="border border-black" />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Λήξη Συνδρομής</label>
                  <Input name="subscription_expires" type="date" value={editForm.subscription_expires} onChange={handleEditFormChange} className="border border-black" />
                </div>
                {/* Duplicate "Υπόλοιπες Συνεδρίες" input removed */}
                <div className="flex justify-center w-full gap-4 pt-2">
                  <Button variant="outline" type="button" onClick={() => setEditModal({ open: false, trainee: null })} disabled={updating}>
                    Ακύρωση
                  </Button>
                  <Button variant="default" type="submit" disabled={updating}>
                    {updating ? "Αποθήκευση..." : "Αποθήκευση"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Helper for rendering options
// Prevent layout shift when dropdown is open by adding/removing a class to <body>
import { Fragment, useState as useDropdownState, useEffect as useDropdownEffect, useRef as useDropdownRef } from "react"

function getScrollbarWidth() {
  if (typeof window === 'undefined') return 0;
  // Only check for desktop
  if (window.innerWidth < 768) return 0;
  const container = document.createElement('div');
  container.style.visibility = 'hidden';
  container.style.overflow = 'scroll';
  container.style.msOverflowStyle = 'scrollbar';
  container.style.width = '100px';
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  document.body.appendChild(container);
  const inner = document.createElement('div');
  inner.style.width = '100%';
  container.appendChild(inner);
  const scrollbarWidth = container.offsetWidth - inner.offsetWidth;
  document.body.removeChild(container);
  return scrollbarWidth;
}

function SelectDropdown({ value, onChange, options, placeholder, name, disabled }) {
  const [open, setOpen] = useDropdownState(false);

  // No body padding logic for dropdowns!

  return (
    <Listbox
      value={value}
      onChange={val => onChange({ target: { name, value: val } })}
      disabled={disabled}
      as={Fragment}
    >
      {({ open: listboxOpen }) => {
        useDropdownEffect(() => { setOpen(listboxOpen); }, [listboxOpen]);
        return (
          <div className="relative w-full">
            <Listbox.Button className="w-full px-2 py-1 pr-8 text-left bg-white border border-black rounded appearance-none focus:outline-none focus:ring-2 focus:ring-black">
              {value || <span className="text-gray-400">{placeholder}</span>}
              <span className="absolute text-gray-700 transform -translate-y-1/2 pointer-events-none right-2 top-1/2">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 w-full mt-1 overflow-auto bg-white border border-black rounded shadow-lg max-h-60">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  className={({ active, selected }) =>
                    `cursor-pointer select-none px-4 py-2 ${active ? 'bg-gray-100' : ''} ${selected ? 'font-bold' : ''}`
                  }
                >
                  {option.label}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        )
      }}
    </Listbox>
  )
}

// Add global style to always show vertical scrollbar on html (prevents layout shift)
// Also set background to match page to avoid dark line next to scrollbar
// Prevent page shift by disabling body scroll and hiding overflow when modal is open
if (typeof window !== 'undefined') {
  const styleId = 'always-scrollbar-style';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `html { overflow-y: scroll !important; background: #f9fafb !important; }
body { background: transparent !important; transition: padding-right 0.2s; }
body.modal-open { overflow: hidden !important; position: fixed !important; width: 100vw !important; padding-right: 16px !important; }`;
    document.head.appendChild(style);
  }
}
