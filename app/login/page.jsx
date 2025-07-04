"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"



export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [rememberMe, setRememberMe] = useState(false)

  // Load remembered username on mount (only in browser)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const remembered = localStorage.getItem("rememberedCredentials")
      if (remembered) {
        const { username, password } = JSON.parse(remembered)
        setUsername(username)
        setPassword(password)
        setRememberMe(true)
      }
    }
  }, [])

  const handleLogin = async () => {
    setError("")
    if (!username || !password) {
      setError("Please enter your username and password.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("http://localhost:8000/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      setLoading(false)

      if (response.ok) {
        const user = await response.json()
        localStorage.setItem("user", JSON.stringify(user))

        if (rememberMe) {
          localStorage.setItem("rememberedCredentials", JSON.stringify({ username, password }))
        } else {
          localStorage.removeItem("rememberedCredentials")
        }

        router.push("/admin-panel")
      } else {
        const errorData = await response.json()
        setError(errorData.detail || "Incorrect username or password.")
      }
    } catch (err) {
      setLoading(false)
      setError("Server error. Please try again later.")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-2 py-8 sm:px-4 bg-gradient-to-br from-gray-100 to-gray-200">
      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center justify-center flex-1 w-full max-w-md"
      >
        <div className="flex flex-col items-center w-full px-4 py-6 bg-white shadow-xl backdrop-blur-lg rounded-3xl sm:px-8 sm:py-10">
          <div className="bg-black w-32 h-32 rounded-full flex items-center justify-center shadow-lg mb-5 shadow-[#000000]">
            <img
              src="/Hephaestack-Logo.png"
              alt="Logo"
              className="object-cover w-32 h-24"
              style={{ background: "none" }}
            />
          </div>

          <h1 className="text-2xl mb-5 sm:text-3xl font-extrabold text-[#000000] text-center tracking-tight drop-shadow">
            Forging Solutions
          </h1>

          {/* Admin Users Info */}
          <div className="w-full max-w-xs p-3 mb-4 border border-blue-200 bg-blue-50 rounded-xl">
            <p className="mb-2 text-xs font-semibold text-blue-800">Admin Users:</p>
            <div className="space-y-1 text-xs text-blue-700">
              <div>Admin: admin / admin123</div>
              <div>Phone: 1234567890 / password</div>
            </div>
          </div>

          <input
            type="text"
            placeholder="Username"
            className="w-full text-[#000000] max-w-xs mb-3 px-4 py-2 rounded-xl border border-[#000000] focus:outline-none focus:ring-2 focus:ring-[#000000] placeholder:text-[#000000] placeholder:font-semibold"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full max-w-xs mb-3 text-black px-4 py-2 rounded-xl border border-[#000000] focus:outline-none focus:ring-2 focus:ring-[#000000] placeholder:text-[#000000] placeholder:font-semibold"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <label className="flex items-center w-full max-w-xs mb-5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe((v) => !v)}
              className="form-checkbox accent-[#000000] border-[#000000] mr-2"
              disabled={loading}
            />
            <span className="text-[#000000] font-semibold text-sm">Remember Me</span>
          </label>

          {error && (
            <div className="w-full max-w-xs mb-4 text-center text-[#b94a48] bg-[#fbeee6] border border-[#f5c6cb] rounded-xl px-3 py-2 font-semibold text-sm">
              {error}
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.03 }}
            className="btn-primary bg-black text-lg rounded-xl border border-black text-white w-full max-w-xs px-4 py-2 font-semibold transition-colors duration-200 hover:bg-[#232323] focus:outline-none focus:ring-2 focus:ring-[#000000] focus:ring-opacity-50"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Connecting..." : "Login"}
          </motion.button>
        </div>
      </motion.main>
    </div>
  )
}
