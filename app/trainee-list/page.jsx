"use client"
 
  function formatDateDMY(dateString) {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  }

  // Convert dd/mm/yyyy to yyyy-mm-dd (for input type="date")
  function toInputDateFormat(dmy) {
    if (!dmy || !dmy.includes('/')) return dmy;
    const [day, month, year] = dmy.split('/').map(x => x.trim());
    const formattedMonth = month.padStart(2, '0');
    const formattedDay = day.padStart(2, '0');
    console.log(`Converting date: ${dmy} -> ${year}-${formattedMonth}-${formattedDay}`);
    return `${year}-${formattedMonth}-${formattedDay}`;
  }


  function toDMYFormat(ymd) {
    if (!ymd || !ymd.includes('-')) return ymd;
    const [year, month, day] = ymd.split('-').map(x => x.trim());
    const formattedMonth = month.padStart(2, '0');
    const formattedDay = day.padStart(2, '0');
    console.log(`Converting date: ${ymd} -> ${formattedDay}/${formattedMonth}/${year}`);
    return `${formattedDay}/${formattedMonth}/${year}`;
  }

import { useState, useEffect, useRef } from "react"
import { Search, Download, Plus, List, Grid, ArrowLeft, Trash2, Info } from "lucide-react"
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
import { useEffect as useBodyModalEffect } from "react";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { elGR } from '@mui/x-date-pickers/locales';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);



export default function TraineePage() {
  const router = useRouter()
  // Snackbar state (must be inside the component)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', success: true });
  const snackbarTimeout = useRef(null);
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
    password: '',
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
      .then(async (res) => {
        let data = res.data;
        // Robust: always set an array
        let users = [];
        if (Array.isArray(data)) {
          users = data;
        } else if (data && Array.isArray(data.users)) {
          users = data.users;
        }

        // Fetch detailed user data with subscriptions for each user
        const detailedUsers = await Promise.all(
          users.map(async (user) => {
            try {
              const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}`,
                { withCredentials: true }
              );
              // Ensure we have the proper user data structure with subscriptions
              const userData = response.data && response.data.id ? response.data : 
                             (response.data && response.data.user ? response.data.user : user);
              
              // Make sure subscriptions is always an array
              if (!userData.subscriptions) {
                userData.subscriptions = [];
              }
              
              return userData;
            } catch (error) {
              console.error(`Error fetching details for user ${user.id}:`, error);
              return { ...user, subscriptions: [] };
            }
          })
        );

        // Sort by created_at descending (most recent first)
        detailedUsers.sort((a, b) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bTime - aTime;
        });

        setTrainees(detailedUsers);
        console.log('Fetched trainees:', detailedUsers);
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
    // Always fetch latest user data including subscriptions
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${trainee.id}`, { withCredentials: true })
      .then(res => {
        const user = res.data && res.data.id ? res.data : (res.data && res.data.user ? res.data.user : trainee);
        // Find active subscription
        const activeSubscription = user.subscriptions?.find(sub => 
          new Date(sub.end_date) >= new Date()
        ) || user.subscriptions?.[0]; // fallback to first subscription if no active one
        
        setEditForm({
          name: user.name || '',
          phone: user.phone || '',
          city: user.city || '',
          gender: user.gender || '',
          password: user.password || '',
          subscription_model: activeSubscription?.subscription_model || '',
          package_total: activeSubscription?.package_total || '',
          subscription_starts: activeSubscription?.start_date ? toDMYFormat(activeSubscription.start_date.split('T')[0]) : '',
          subscription_expires: activeSubscription?.end_date ? toDMYFormat(activeSubscription.end_date.split('T')[0]) : '',
          remaining_classes: activeSubscription?.remaining_classes || '',
        });
        setEditModal({ open: true, trainee });
      })
      .catch(() => {
        setEditForm({
          name: trainee.name || '',
          phone: trainee.phone || '',
          city: trainee.city || '',
          gender: trainee.gender || '',
          password: trainee.password || '',
          subscription_model: trainee.subscription_model || '',
          package_total: trainee.package_total || '',
          subscription_starts: trainee.subscription_starts ? toDMYFormat(trainee.subscription_starts.split('T')[0]) : '',
          subscription_expires: trainee.subscription_expires ? toDMYFormat(trainee.subscription_expires.split('T')[0]) : '',
          remaining_classes: trainee.remaining_classes || '',
        });
        setEditModal({ open: true, trainee });
      });
  }

  // Refs for each input in the edit modal
  const editRefs = {
    name: useRef(),
    phone: useRef(),
    city: useRef(),
    gender: useRef(),
    password: useRef(),
    subscription_model: useRef(),
    subscription_starts: useRef(),
    subscription_expires: useRef(),
  };

  // Order of fields for Enter navigation
  const editFieldOrder = [
    'name',
    'phone',
    'city',
    'gender',
    'password',
    'subscription_model',
    'subscription_starts',
    'subscription_expires',
  ];

  // Handle form field change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'subscription_model') {
      let newForm = { ...editForm, [name]: value };
      const key = value ? value.trim().toLowerCase() : '';
      if (key && key.includes('πακέτο')) {
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
    } else if (name === 'subscription_starts' || name === 'subscription_expires') {
      // Accept dd/mm/yyyy from input, store as dd/mm/yyyy
      setEditForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setEditForm((prev) => ({ ...prev, [name]: value }))
    }
  };

  // Handle Enter key to go to next input or save
  const handleEditKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const idx = editFieldOrder.indexOf(field);
      if (idx < editFieldOrder.length - 1) {
        // Focus next input
        const nextField = editFieldOrder[idx + 1];
        if (editRefs[nextField] && editRefs[nextField].current) {
          editRefs[nextField].current.focus();
        }
      } else {
        // Last field, submit
        handleEditSubmit();
      }
    }
  };

  // Submit edit
  const handleEditSubmit = async (e) => {
    e?.preventDefault(); // Prevent form submission if called from form submit
    console.log('Starting edit submission...');
    setUpdating(true);
    try {
      const id = editModal.trainee.id;
      console.log('Editing trainee with ID:', id);
      
      // First update user basic info
      const userData = {
        name: editForm.name || '',
        phone: editForm.phone || '',
        city: editForm.city || '',
        gender: editForm.gender || '',
        password: editForm.password || ''
      };
      
      // Update user info
      try {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${id}`, 
          userData, 
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('User info update successful');
      } catch (putError) {
        console.error('User update failed:', putError.response?.data || putError.message);
        throw putError;
      }

      // If subscription data is provided, create or update subscription
      if (editForm.subscription_model) {
        const subscriptionData = {
          subscription_model: editForm.subscription_model,
          start_date: editForm.subscription_starts ? toInputDateFormat(editForm.subscription_starts) : null,
          end_date: editForm.subscription_expires ? toInputDateFormat(editForm.subscription_expires) : null,
          package_total: editForm.subscription_model?.toLowerCase().includes('πακέτο')
            ? Number(editForm.package_total) || null
            : null,
          remaining_classes: editForm.subscription_model?.toLowerCase().includes('πακέτο')
            ? (editForm.remaining_classes !== '' ? Number(editForm.remaining_classes) : null)
            : null
        };
        
        console.log('Sending subscription data:', subscriptionData);
        
        try {
          // Get current subscriptions
          const currentSubs = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/${id}`,
            { withCredentials: true }
          );
          
          // Find active subscription
          const activeSubscription = currentSubs.data.find(sub => 
            new Date(sub.end_date) >= new Date()
          );
          
          let subResponse;
          if (activeSubscription) {
            // Update existing subscription
            console.log('Updating existing subscription:', activeSubscription.id);
            subResponse = await axios.put(
              `${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions/${activeSubscription.id}`,
              subscriptionData,
              {
                withCredentials: true,
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
          } else {
            // Create new subscription
            console.log('Creating new subscription for user:', id);
            subResponse = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/admin/subscriptions/${id}`,
              subscriptionData,
              {
                withCredentials: true,
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );
          }
          console.log('Subscription update response:', subResponse.data);
        } catch (subError) {
          console.error('Subscription update failed:', subError.response?.data || subError.message);
          throw subError;
        }
      }

      // Add a small delay to ensure backend has processed all changes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fetch updated user data including subscriptions
      console.log('Fetching updated user data after successful update...');
      const userResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
        { withCredentials: true }
      );
      
      console.log('Refreshed user data:', userResponse.data);

      let refreshedUser = userResponse.data && userResponse.data.id 
        ? userResponse.data 
        : (userResponse.data && userResponse.data.user 
          ? userResponse.data.user 
          : null);

      if (refreshedUser) {
        console.log('Updated user data:', refreshedUser);
      }

      // Update local state with the freshly fetched data
      setTrainees((prev) => prev.map((t) => {
        if (t.id === id) {
          if (refreshedUser) {
            return {
              ...refreshedUser,
              subscriptions: refreshedUser.subscriptions || []
            };
          }
          // Fallback only if the refresh request failed
          return {
            ...t,
            name: userData.name,
            phone: userData.phone,
            city: userData.city,
            gender: userData.gender,
            password: userData.password,
            subscriptions: editForm.subscription_model ? [
              ...(t.subscriptions || []).filter(s => 
                new Date(s.end_date) < new Date()
              ),
              {
                subscription_model: editForm.subscription_model,
                start_date: editForm.subscription_starts ? toInputDateFormat(editForm.subscription_starts) : null,
                end_date: editForm.subscription_expires ? toInputDateFormat(editForm.subscription_expires) : null,
                package_total: editForm.subscription_model?.toLowerCase().includes('πακέτο')
                  ? Number(editForm.package_total) || null
                  : null,
                remaining_classes: editForm.subscription_model?.toLowerCase().includes('πακέτο')
                  ? (editForm.remaining_classes !== '' ? Number(editForm.remaining_classes) : null)
                  : null,
                user_id: id
              }
            ] : t.subscriptions || []
          };
        }
        return t;
      }));
      setEditModal({ open: false, trainee: null });
      setSnackbar({ open: true, message: 'Η επεξεργασία ολοκληρώθηκε με επιτυχία!', success: true });
      if (snackbarTimeout.current) clearTimeout(snackbarTimeout.current);
      snackbarTimeout.current = setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 2200);
    } catch (err) {
      console.error('Error in handleEditSubmit:', err);
      setSnackbar({ open: true, message: 'Σφάλμα κατά την επεξεργασία. Προσπαθήστε ξανά.', success: false });
      if (snackbarTimeout.current) clearTimeout(snackbarTimeout.current);
      snackbarTimeout.current = setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 2500);
      return; // Exit early on error
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (trainee) => {
    setDeleting(true);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/${trainee.id}`, { withCredentials: true });
      setTrainees((prev) => prev.filter((t) => t.id !== trainee.id));
      setDeleteModal({ open: false, trainee: null });
      setSnackbar({ open: true, message: 'Η διαγραφή ολοκληρώθηκε με επιτυχία!', success: true });
      if (snackbarTimeout.current) clearTimeout(snackbarTimeout.current);
      snackbarTimeout.current = setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 2200);
    } catch (err) {
      setSnackbar({ open: true, message: 'Σφάλμα κατά τη διαγραφή. Προσπαθήστε ξανά.', success: false });
      if (snackbarTimeout.current) clearTimeout(snackbarTimeout.current);
      snackbarTimeout.current = setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 2500);
    } finally {
      setDeleting(false);
    }
  } 



  // No blur for snackbar
  const blurClass = '';

  // Debug: Log date values before rendering
  console.log('editForm.subscription_starts:', editForm.subscription_starts);
  console.log('editForm.subscription_expires:', editForm.subscription_expires);
  return (
    <>
      {/* Main content, blur only when snackbar is open */}
      <div className={`min-h-screen p-2 bg-gray-50 sm:p-4`}>
      {/* Snackbar/Toast Popup */}
      <AnimatePresence>
        {snackbar.open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.35, type: 'spring', stiffness: 200, damping: 22 }}
            className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none"
          >
            <div
              className={`mb-16 px-6 py-4 rounded-lg shadow-xl text-lg font-semibold pointer-events-auto transition-colors duration-200 ${snackbar.success ? 'bg-green-50 text-green-800 border border-green-300' : 'bg-red-50 text-red-800 border border-red-300'}`}
              style={{ minWidth: 280, maxWidth: '90vw' }}
            >
              {snackbar.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
                  <Button variant="outline" size="sm" className="flex-1 bg-white border-[#bbbbbb] ">
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
                  {/* Correct JSX for loading, empty, and data states */}
                  {loading && (
                    <div className="py-8 text-lg text-center text-gray-500">Φόρτωση...</div>
                  )}
                  {!loading && paginatedTrainees.length === 0 && (
                    <div className="py-8 text-lg text-center text-gray-500">Δεν βρέθηκαν μαθητές</div>
                  )}
                  {!loading && paginatedTrainees.length > 0 && (
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
                            <TableHead className="text-lg font-extrabold text-black">Κωδικός</TableHead>
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

                            // Find active subscription
                            const activeSubscription = trainee.subscriptions?.find(sub => 
                              new Date(sub.end_date) >= new Date()
                            ) || trainee.subscriptions?.[0]; // fallback to first subscription if no active one

                            // If we have legacy data format
                            if (trainee.subscription_expires) {
                              const simera = new Date().toISOString().slice(0, 10);
                              if (trainee.subscription_expires >= simera) {
                                katastasi = "Ενεργή";
                              } else {
                                katastasi = "Ανενεργή";
                              }
                              lixi = formatDateDMY(trainee.subscription_expires);
                            } 
                            // If we have new data format with subscriptions
                            else if (activeSubscription?.end_date) {
                              const simera = new Date().toISOString().slice(0, 10);
                              if (new Date(activeSubscription.end_date) >= new Date(simera)) {
                                katastasi = "Ενεργή";
                              } else {
                                katastasi = "Ανενεργή";
                              }
                              lixi = formatDateDMY(activeSubscription.end_date);
                            }
                            
                            if (trainee.phone) kinito = trainee.phone;
                            return (
                              <TableRow key={trainee.id} className="transition-colors duration-150 border-b border-[#bbbbbb] ">
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
                                <TableCell className="text-black py-3 px-2 min-w-[80px]">{(trainee.password !== undefined && trainee.password !== null && String(trainee.password).trim() !== '') ? trainee.password : ''}</TableCell>
                                <TableCell className="text-black py-3 px-2 min-w-[120px]">{kinito}</TableCell>
                                <TableCell className="text-black py-3 px-2 min-w-[80px]">
                                  <span className={katastasi === "Ενεργή" ? "text-green-600 font-bold" : katastasi === "Ανενεργή" ? "text-red-600 font-bold" : "text-gray-400"}>{katastasi}</span>
                                </TableCell>
                                <TableCell className="text-black py-3 px-2 min-w-[120px]">{lixi}</TableCell>
                                <TableCell className="py-3 px-2 min-w-[80px] text-center">
                                <div className="flex justify-center gap-2">
                                  <Button variant="outline" size="icon" onClick={() => router.push(`/trainee-info?id=${trainee.id}`)}>
                                    <Info className="w-4 h-4" />
                                  </Button>
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
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Correct JSX for loading, empty, and data states in grid view */}
              {loading && (
                <div className="py-8 text-lg text-center text-gray-500">Φόρτωση...</div>
              )}
              {!loading && paginatedTrainees.length === 0 && (
                <div className="py-8 text-lg text-center text-gray-500">Δεν βρέθηκαν μαθητές</div>
              )}
              {!loading && paginatedTrainees.length > 0 && (
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
                    
                    // Find active subscription
                    const activeSubscription = trainee.subscriptions?.find(sub => 
                      new Date(sub.end_date) >= new Date()
                    ) || trainee.subscriptions?.[0]; // fallback to first subscription if no active one
                    
                    if (activeSubscription?.end_date) {
                      const simera = new Date().toISOString().slice(0, 10);
                      if (activeSubscription.end_date >= simera) katastasi = "Ενεργή";
                      else katastasi = "Ανενεργή";
                      lixi = formatDateDMY(activeSubscription.end_date);
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
                          {trainee.city || "-"}{(trainee.password !== undefined && trainee.password !== null && String(trainee.password).trim() !== '') ? ` • ${trainee.password}` : ''}
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
                        {/* Info/Edit/Delete Buttons */}
                        <div className="flex justify-center gap-2 mt-3">
                          <Button variant="outline" size="icon" onClick={() => router.push(`/trainee-info?id=${trainee.id}`)}>
                            <Info className="w-4 h-4" />
                          </Button>
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
            </>
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
              className="bg-white border-[#bbbbbb] "
              disabled={page === 1}
              onClick={() => { setDirection(-1); setPage(p => Math.max(1, p - 1)); }}
            >
              ← Προηγούμενη
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-[#bbbbbb] "
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
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
                  <Input
                    name="name"
                    value={editForm.name}
                    onChange={handleEditFormChange}
                    className="border border-black"
                    ref={editRefs.name}
                    onKeyDown={e => handleEditKeyDown(e, 'name')}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Κινητό</label>
                  <Input
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditFormChange}
                    className="border border-black"
                    ref={editRefs.phone}
                    onKeyDown={e => handleEditKeyDown(e, 'phone')}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Πόλη</label>
                  <Input
                    name="city"
                    value={editForm.city}
                    onChange={handleEditFormChange}
                    className="border border-black"
                    ref={editRefs.city}
                    onKeyDown={e => handleEditKeyDown(e, 'city')}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Φύλο</label>
                  <select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-1 border border-black rounded"
                    ref={editRefs.gender}
                    onKeyDown={e => handleEditKeyDown(e, 'gender')}
                  >
                    <option value="">-</option>
                    <option value="Άνδρας">Άνδρας</option>
                    <option value="Γυναίκα">Γυναίκα</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Κωδικός</label>
                  <Input
                    name="password"
                    value={editForm.password}
                    onChange={handleEditFormChange}
                    className="border border-black"
                    ref={editRefs.password}
                    onKeyDown={e => handleEditKeyDown(e, 'password')}
                    disabled={updating}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Τύπος Συνδρομής</label>
                  <select
                    name="subscription_model"
                    value={editForm.subscription_model}
                    onChange={handleEditFormChange}
                    className="w-full px-2 py-1 border border-black rounded"
                    disabled={updating}
                    ref={editRefs.subscription_model}
                    onKeyDown={e => handleEditKeyDown(e, 'subscription_model')}
                  >
                    <option value="">-</option>
                    {(Array.isArray(subscriptionModels) ? subscriptionModels : []).map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
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
                  <LocalizationProvider dateAdapter={AdapterDayjs} localeText={elGR.localeText}>
                    <DatePicker
                      value={(() => {
                        const val = editForm.subscription_starts;
                        if (!val || val === '-') return null;
                        if (val.includes('/')) {
                          const d = dayjs(val, 'DD/MM/YYYY');
                          return d.isValid() ? d : null;
                        }
                        const d = dayjs(val);
                        return d.isValid() ? d : null;
                      })()}
                      onChange={date => {
                        if (date && date.isValid()) {
                          handleEditFormChange({
                            target: {
                              name: 'subscription_starts',
                              value: date.format('DD/MM/YYYY')
                            }
                          });
                        }
                      }}
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          variant: 'outlined',
                          sx: {
                            backgroundColor: '#fff',
                            borderRadius: 2,
                            border: '1px solid ',
                            color: '#111',
                            fontWeight: 500,
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              background: '#fff',
                              color: '#111',
                              fontWeight: 500,
                              border: 'none',
                              boxShadow: 'none',
                              '& fieldset': {
                                borderColor: '#222',
                              },
                              '&:hover fieldset': {
                                borderColor: '#000',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#000',
                              },
                            },
                            '& .MuiInputBase-input': {
                              color: '#111',
                              fontWeight: 500,
                              background: '#fff',
                            },
                            '& .MuiSvgIcon-root': {
                              color: '#111',
                            },
                          },
                          size: 'small',
                        },
                        popper: {
                          sx: {
                            '& .MuiPaper-root': {
                              background: '#fff',
                              color: '#111',
                              border: '1px solid #222',
                              borderRadius: 2,
                              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                            },
                            '& .MuiPickersDay-root': {
                              color: '#111',
                              fontWeight: 500,
                              '&.Mui-selected': {
                                background: '#111',
                                color: '#fff',
                              },
                              '&:hover': {
                                background: '#222',
                                color: '#fff',
                              },
                            },
                            '& .MuiPickersCalendarHeader-label': {
                              color: '#111',
                              fontWeight: 700,
                            },
                            '& .MuiPickersArrowSwitcher-button': {
                              color: '#111',
                            },
                          },
                        },
                      }}
                      disabled={updating}
                    />
                  </LocalizationProvider>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Λήξη Συνδρομής</label>
                  <LocalizationProvider dateAdapter={AdapterDayjs} localeText={elGR.localeText}>
                    <DatePicker
                      value={(() => {
                        const val = editForm.subscription_expires;
                        if (!val || val === '-') return null;
                        if (val.includes('/')) {
                          const d = dayjs(val, 'DD/MM/YYYY');
                          return d.isValid() ? d : null;
                        }
                        const d = dayjs(val);
                        return d.isValid() ? d : null;
                      })()}
                      onChange={date => {
                        if (date && date.isValid()) {
                          handleEditFormChange({
                            target: {
                              name: 'subscription_expires',
                              value: date.format('DD/MM/YYYY')
                            }
                          });
                        }
                      }}
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          variant: 'outlined',
                          sx: {
                            backgroundColor: '#fff',
                            borderRadius: 2,
                            border: '1px solid ',
                            color: '#111',
                            fontWeight: 500,
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              background: '#fff',
                              color: '#111',
                              fontWeight: 500,
                              border: 'none',
                              boxShadow: 'none',
                              '& fieldset': {
                                borderColor: '#222',
                              },
                              '&:hover fieldset': {
                                borderColor: '#000',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#000',
                              },
                            },
                            '& .MuiInputBase-input': {
                              color: '#111',
                              fontWeight: 500,
                              background: '#fff',
                            },
                            '& .MuiSvgIcon-root': {
                              color: '#111',
                            },
                          },
                          size: 'small',
                        },
                        popper: {
                          sx: {
                            '& .MuiPaper-root': {
                              background: '#fff',
                              color: '#111',
                              border: '1px solid #222',
                              borderRadius: 2,
                              boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                            },
                            '& .MuiPickersDay-root': {
                              color: '#111',
                              fontWeight: 500,
                              '&.Mui-selected': {
                                background: '#111',
                                color: '#fff',
                              },
                              '&:hover': {
                                background: '#222',
                                color: '#fff',
                              },
                            },
                            '& .MuiPickersCalendarHeader-label': {
                              color: '#111',
                              fontWeight: 700,
                            },
                            '& .MuiPickersArrowSwitcher-button': {
                              color: '#111',
                            },
                          },
                        },
                      }}
                      disabled={updating}
                    />
                  </LocalizationProvider>
                </div>
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


