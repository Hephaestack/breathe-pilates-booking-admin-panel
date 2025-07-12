"use client"
import React from "react"
import axios from "axios"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"

export default function AddTraineePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    city: "",
    phone: "",
    gender: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleGenderChange = (value) => {
    setForm({ ...form, gender: value })
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
    <div className="relative flex flex-col items-center justify-center w-full min-h-screen bg-gradient-to-br from-white to-gray-200 overflow-x-hidden">
      {/* Back Button - Top Corner */}
      <div className="absolute z-10 top-4 left-4">
        <Button onClick={() => router.push("/admin-panel")} variant="outline" className="text-white bg-black hover:bg-gray-900 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Επιστροφή στον Πίνακα Διαχείρισης
        </Button>
      </div>

      <motion.main
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col items-center justify-center flex-1 w-full max-w-md px-2 py-8 sm:px-4"
        style={{ minHeight: 'inherit' }}
      >
        <Card className="w-full shadow-2xl shadow-black bg-white/95">
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
              <Input
                type="text"
                name="name"
                placeholder="Ονοματεπώνυμο"
                className="w-full rounded-md border-black focus:ring-black placeholder:text-gray-700 placeholder:font-semibold"
                value={form.name}
                onChange={handleChange}
                disabled={loading}
                autoComplete="off"
                aria-label="Ονοματεπώνυμο"
              />
              <Input
                type="text"
                name="city"
                placeholder="Πόλη"
                className="w-full rounded-md border-black focus:ring-black placeholder:text-gray-700 placeholder:font-semibold"
                value={form.city}
                onChange={handleChange}
                disabled={loading}
                autoComplete="off"
                aria-label="Πόλη"
              />
              <Input
                type="text"
                name="phone"
                placeholder="Τηλέφωνο"
                className="w-full rounded-md border-black focus:ring-black placeholder:text-gray-700 placeholder:font-semibold"
                value={form.phone || ""}
                onChange={handleChange}
                disabled={loading}
                autoComplete="off"
                aria-label="Τηλέφωνο"
              />
              <Select value={form.gender} onValueChange={handleGenderChange} disabled={loading}>
                <SelectTrigger className="w-full rounded-md border-black focus:ring-black">
                  <SelectValue placeholder="Φύλο" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error && (
                <div className="w-full text-center text-[#b94a48] bg-[#fbeee6] border border-[#f5c6cb] px-3 py-2 font-semibold text-sm animate-pulse rounded-md">
                  {error}
                </div>
              )}
              {success && (
                <div className="w-full px-3 py-2 text-sm font-semibold text-center text-green-700 border border-green-300 bg-green-50 animate-pulse rounded-md">
                  {success}
                </div>
              )}
              <Button
                type="submit"
                className="w-full px-4 py-2 text-lg font-semibold text-white transition-transform duration-200 bg-black border border-black shadow-md rounded-md hover:scale-105 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
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