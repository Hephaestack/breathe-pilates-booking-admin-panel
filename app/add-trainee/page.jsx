"use client"
import React from "react"
import axios from "axios"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"

export default function AddTraineePage() {
  const router = useRouter()
  const dropdownRef = useRef(null)
  const [form, setForm] = useState({
    name: "",
    city: "",
    phone: "",
    gender: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showGenderDropdown, setShowGenderDropdown] = useState(false)

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowGenderDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (!form.name || !form.city || !form.phone || !form.gender) {
      setError("Παρακαλώ συμπληρώστε όλα τα απαιτούμενα πεδία.")
      return
    }
    setLoading(true)
    try {
      // Map Greek gender to backend enum value
      // Map Greek gender to backend enum value ONLY for Greek options, fallback to empty string
      let genderValue = "";
      if (form.gender === "Άντρας") genderValue = "Άνδρας";
      else if (form.gender === "Γυναίκα") genderValue = "Γυναίκα";
      // Defensive: if user somehow selects a non-Greek value, set error and return
      else {
        setError("Μη έγκυρη επιλογή φύλου. Επιλέξτε Άντρας ή Γυναίκα.");
        setLoading(false);
        return;
      }
      const payload = {
        name: form.name,
        phone: form.phone,
        city: form.city,
        gender: genderValue
      }
      // Debug: log payload to verify values sent
     
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users`,
        payload,
        { withCredentials: true }
      );
      setLoading(false);
      if (response.status === 200 || response.status === 201) {
        router.push("/trainee-list");
      } else {
        let errorMsg = "Αποτυχία προσθήκης ασκούμενου.";
        if (response.data && response.data.detail) {
          errorMsg += ` (${Array.isArray(response.data.detail) ? response.data.detail.map(d => d.msg).join('; ') : response.data.detail})`;
        }
        setError(errorMsg);
      }
    } catch {
      setLoading(false)
      setError("Σφάλμα διακομιστή. Προσπαθήστε ξανά αργότερα.")
    }
  }

  const genderOptions = ["Άντρας", "Γυναίκα"];

  return (
    <div className=" flex flex-col items-center justify-center w-full min-h-screen px-2 py-8 sm:px-4 bg-gradient-to-br from-white to-gray-200">
      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center flex-1 w-full max-w-md"
      >
        <Card className="w-full  shadow-black shadow-2xl bg-white/95">
          <CardHeader>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center w-16 h-16 mt-2 mb-2 bg-black rounded-full shadow-lg">
                <div className="flex items-center justify-center w-full h-full">
                  <span className="text-3xl font-bold text-white" style={{lineHeight: '1', transform: 'translateY(-2px)'}}>+</span>
                </div>
              </div>
              <CardTitle className="text-2xl font-extrabold text-center text-black drop-shadow">Προσθήκη Ασκούμενου</CardTitle>
              <p className="text-sm text-center text-gray-600">Συμπληρώστε τα παρακάτω στοιχεία για να προσθέσετε έναν νέο ασκούμενο στο σύστημα.</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                name="name"
                placeholder="Ονοματεπώνυμο"
                className="w-full px-4 py-2 bg-white border border-black shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-700 placeholder:font-semibold"
                value={form.name}
                onChange={handleChange}
                disabled={loading}
                autoComplete="off"
                aria-label="Ονοματεπώνυμο"
              />
              <input
                type="text"
                name="city"
                placeholder="Πόλη"
                className="w-full px-4 py-2 bg-white border border-black shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-700 placeholder:font-semibold"
                value={form.city}
                onChange={handleChange}
                disabled={loading}
                autoComplete="off"
                aria-label="Πόλη"
              />
              <input
                type="text"
                name="phone"
                placeholder="Τηλέφωνο"
                className="w-full px-4 py-2 bg-white border border-black shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-700 placeholder:font-semibold"
                value={form.phone || ""}
                onChange={handleChange}
                disabled={loading}
                autoComplete="off"
                aria-label="Τηλέφωνο"
              />
              <div className="relative w-full " ref={dropdownRef}>
                <select
                  id="gender"
                  name="gender"
                  className="w-full px-4 py-2 bg-white border border-black shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-black placeholder:text-gray-700"
                  value={form.gender}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  aria-label="Φύλο"
                >
                  <option value="" disabled hidden>Φύλο</option>
                  {genderOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              {error && (
                <div className="w-full text-center text-[#b94a48] bg-[#fbeee6] border border-[#f5c6cb] rounded-xl px-3 py-2 font-semibold text-sm animate-pulse">
                  {error}
                </div>
              )}
              {success && (
                <div className="w-full px-3 py-2 text-sm font-semibold text-center text-green-700 border border-green-300 bg-green-50 rounded-xl animate-pulse">
                  {success}
                </div>
              )}
              <Button
                type="submit"
                className=" w-full px-4 py-2 text-lg font-semibold text-white transition-transform duration-200 bg-black border border-black shadow-md rounded-xl hover:scale-105 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
                disabled={loading}
              >
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
