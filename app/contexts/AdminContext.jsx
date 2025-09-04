"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AdminContext = createContext()

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

export const AdminProvider = ({ children }) => {
  const [adminInfo, setAdminInfo] = useState(null)
  const [loadingAdmin, setLoadingAdmin] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Fetch admin info on mount (after login)
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/me`,
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        console.log('Admin info fetched:', response.data)
        setAdminInfo(response.data)
        setIsAuthenticated(true)
      } catch (error) {
        console.error("Error fetching admin info:", error)
        setAdminInfo(null)
        setIsAuthenticated(false)
        // Redirect to login if unauthorized
        if (error.response?.status === 401) {
          window.location.href = '/login'
        }
      } finally {
        setLoadingAdmin(false)
      }
    }

    fetchAdminInfo()
  }, [])

  // Secure API call wrapper with admin ID in headers
  const secureApiCall = async (url, options = {}) => {
    if (!adminInfo?.id) {
      throw new Error('Admin not authenticated')
    }

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-User-Id': adminInfo.id,
      ...options.headers
    }

    return axios({
      url: `${process.env.NEXT_PUBLIC_API_URL}${url}`,
      withCredentials: true,
      ...options,
      headers: defaultHeaders
    })
  }

  const value = {
    adminInfo,
    loadingAdmin,
    isAuthenticated,
    secureApiCall
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}
