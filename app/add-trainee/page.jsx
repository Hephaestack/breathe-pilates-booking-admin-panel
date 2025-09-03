"use client"
import React, { useRef, useEffect } from "react"
import axios from "axios"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"


export default function AddTraineePage() {
  // Refs for focus management
  const nameRef = useRef(null);
  const cityRef = useRef(null);
  const phoneRef = useRef(null);
  const genderRef = useRef(null);
  const studioRef = useRef(null);
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    city: "",
    phone: "",
    gender: "",
    studio_id: ""
  })
  const [studios, setStudios] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingStudios, setLoadingStudios] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Fetch studios on component mount
  useEffect(() => {
    const fetchStudios = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/studios`,
          { withCredentials: true }
        )
        console.log('Studios API response:', response.data)
        
        // Handle both current backend format (array of strings) and future format (array of objects)
        if (Array.isArray(response.data)) {
          if (response.data.length > 0 && typeof response.data[0] === 'string') {
            // Current backend format: ["Studio Name 1", "Studio Name 2"]
            const studiosWithIds = response.data.map((name, index) => ({
              id: index.toString(), // Temporary ID until backend is fixed
              name: name
            }))
            console.log('Converted studios:', studiosWithIds)
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
        setError("Σφάλμα κατά τη φόρτωση των studios.")
      } finally {
        setLoadingStudios(false)
      }
    }

    fetchStudios()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleGenderChange = (e) => {
    setForm({ ...form, gender: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!form.name || !form.city || !form.phone || !form.gender || !form.studio_id) {
      setError("Παρακαλώ συμπληρώστε όλα τα απαιτούμενα πεδία.")
      return
    }

    setLoading(true)
    try {
      let genderValue = ""
      if (form.gender === "Άντρας") genderValue = "Άνδρας"
      else if (form.gender === "Γυναίκα") genderValue = "Γυναίκα"
      else {
        setError("Μη έγκυρη επιλογή φύλου. Επιλέξτε Άντρας ή Γυναίκα.")
        setLoading(false)
        return
      }

      const payload = {
        name: form.name,
        phone: form.phone,
        city: form.city,
        gender: genderValue,
        studio_id: form.studio_id
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users`,
        payload,
        { withCredentials: true }
      )

      setLoading(false)
      if (response.status === 200 || response.status === 201) {
        router.push("/trainee-list")
      } else {
        let errorMsg = "Αποτυχία προσθήκης ασκούμενου."
        if (response.data && response.data.detail) {
          errorMsg += ` (${Array.isArray(response.data.detail)
            ? response.data.detail.map((d) => d.msg).join("; ")
            : response.data.detail
            })`
        }
        setError(errorMsg)
      }
    } catch {
      setLoading(false)
      setError("Σφάλμα διακομιστή. Προσπαθήστε ξανά αργότερα.")
    }
  }

  // Helper to move focus to next field
  const focusNext = (ref) => {
    if (ref && ref.current) ref.current.focus();
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-white to-gray-200">
      {/* Back Button */}
      <div className="absolute z-10 top-4 left-4">
        <Button
          onClick={() => router.push("/admin-panel")}
          variant="outline"
          className="text-white bg-black hover:bg-gray-900 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Επιστροφή στον Πίνακα Διαχείρισης
        </Button>
      </div>

      <motion.main
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col items-center justify-center flex-1 w-full max-w-md px-2 py-8 sm:px-4"
        style={{ minHeight: "inherit" }}
      >
        <Card className="w-full shadow-2xl shadow-black bg-white/95">
          <CardHeader>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center w-16 h-16 mt-2 mb-2 bg-black rounded-full shadow-lg">
                <span className="text-3xl font-bold text-white" style={{ lineHeight: "1", transform: "translateY(-2px)" }}>
                  +
                </span>
              </div>
              <CardTitle className="text-2xl font-extrabold text-center text-black drop-shadow">
                Προσθήκη Ασκούμενου
              </CardTitle>
              <p className="text-sm text-center text-gray-600">
                Συμπληρώστε τα παρακάτω στοιχεία για να προσθέσετε έναν νέο ασκούμενο στο σύστημα.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              <Input
                ref={nameRef}
                type="text"
                name="name"
                placeholder="Ονοματεπώνυμο"
                className="w-full h-12 px-3 py-2 text-base border-black rounded-md focus:ring-black placeholder:text-gray-700 placeholder:font-semibold"
                value={form.name}
                onChange={handleChange}
                disabled={loading}
                autoComplete="off"
                aria-label="Ονοματεπώνυμο"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!form.name) return;
                    focusNext(cityRef);
                  }
                }}
              />
              <Input
                ref={cityRef}
                type="text"
                name="city"
                placeholder="Πόλη"
                className="w-full h-12 px-3 py-2 text-base border-black rounded-md focus:ring-black placeholder:text-gray-700 placeholder:font-semibold"
                value={form.city}
                onChange={handleChange}
                disabled={loading}
                autoComplete="off"
                aria-label="Πόλη"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!form.city) return;
                    focusNext(phoneRef);
                  }
                }}
              />
              <Input
                ref={phoneRef}
                type="text"
                name="phone"
                placeholder="Τηλέφωνο"
                className="w-full h-12 px-3 py-2 text-base border-black rounded-md focus:ring-black placeholder:text-gray-700 placeholder:font-semibold"
                value={form.phone}
                onChange={handleChange}
                disabled={loading}
                autoComplete="off"
                aria-label="Τηλέφωνο"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!form.phone) return;
                    focusNext(genderRef);
                  }
                }}
              />
          

              <select
                ref={genderRef}
                name="gender"
                value={form.gender}
                onChange={handleGenderChange}
                disabled={loading}
                className="w-full h-12 px-3 py-2 text-base font-semibold bg-white border border-black rounded-md appearance-none focus:ring-black placeholder:text-gray-700 placeholder:font-semibold"
                aria-label="Φύλο"
                style={{ minHeight: '3rem' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!form.gender) return;
                    focusNext(studioRef);
                  }
                }}
              >
                <option value="" disabled hidden>Φύλο</option>
                <option value="Άντρας">Άντρας</option>
                <option value="Γυναίκα">Γυναίκα</option>
              </select>

              <select
                ref={studioRef}
                name="studio_id"
                value={form.studio_id}
                onChange={handleChange}
                disabled={loading || loadingStudios}
                className="w-full h-12 px-3 py-2 text-base font-semibold bg-white border border-black rounded-md appearance-none focus:ring-black placeholder:text-gray-700 placeholder:font-semibold"
                aria-label="Studio"
                style={{ minHeight: '3rem' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    // Only submit if all fields are filled
                    if (form.name && form.city && form.phone && form.gender && form.studio_id && !loading) {
                      handleSubmit(e);
                    }
                  }
                }}
              >
                <option key="placeholder" value="" disabled hidden>
                  {loadingStudios ? "Φόρτωση Studios..." : "Επιλέξτε Studio"}
                </option>
                {studios.filter(studio => studio && studio.id).map((studio, index) => (
                  <option key={`studio-${studio.id}-${index}`} value={studio.id}>
                    {studio.name}
                  </option>
                ))}
              </select>

              {error && (
                <div className="w-full text-center text-[#b94a48] bg-[#fbeee6] border border-[#f5c6cb] px-3 py-2 font-semibold text-sm animate-pulse rounded-md">
                  {error}
                </div>
              )}
              {success && (
                <div className="w-full px-3 py-2 text-sm font-semibold text-center text-green-700 border border-green-300 rounded-md bg-green-50 animate-pulse">
                  {success}
                </div>
              )}
              <style jsx>{`
                .spinner {
                  border: 2px solid #f3f3f3;
                  border-top: 2px solid #222;
                  border-radius: 50%;
                  width: 18px;
                  height: 18px;
                  animation: spin 0.7s linear infinite;
                  display: inline-block;
                  vertical-align: middle;
                  margin-right: 8px;
                }
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
              <Button
                type="submit"
                className="flex items-center justify-center w-full px-4 py-2 text-lg font-semibold text-white transition-transform duration-200 bg-black border border-black rounded-md shadow-md hover:scale-105 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
                disabled={loading}
              >
                {loading && <span className="spinner" />}
                {loading ? "Προσθήκη..." : "Προσθήκη Ασκούμενου"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="mt-2 mb-2 text-black hover:underline hover:bg-transparent"
                onClick={() => router.push("/admin-panel")}
                disabled={loading}
              >
                ← Επιστροφή στον Πίνακα Διαχείρισης.
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.main>
    </div>
  )
}
