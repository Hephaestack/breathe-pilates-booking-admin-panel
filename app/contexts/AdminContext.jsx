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
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted state after hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch admin info on mount (but only if not on login page)
  useEffect(() => {
    if (!isMounted) return // Don't run during SSR

    const fetchAdminInfo = async () => {
      // Don't fetch admin info if we're on the login page
      if (window.location.pathname === '/login') {
        setLoadingAdmin(false)
        return
      }

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
        // Only redirect to login if we're not already on the login page
        if (error.response?.status === 401 && window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      } finally {
        setLoadingAdmin(false)
      }
    }

    fetchAdminInfo()
  }, [isMounted])

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

  // Method to manually check authentication (useful after login)
  const checkAuthentication = async () => {
    setLoadingAdmin(true)
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
      return true
    } catch (error) {
      console.error("Error fetching admin info:", error)
      setAdminInfo(null)
      setIsAuthenticated(false)
      return false
    } finally {
      setLoadingAdmin(false)
    }
  }

  const value = {
    adminInfo,
    loadingAdmin,
    isAuthenticated,
    secureApiCall,
    checkAuthentication
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}
