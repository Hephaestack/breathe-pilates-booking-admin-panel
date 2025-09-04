"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { useAdmin } from './AdminContext'

const StudioContext = createContext()

export const useStudio = () => {
  const context = useContext(StudioContext)
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider')
  }
  return context
}

export const StudioProvider = ({ children }) => {
  const { adminInfo, secureApiCall, isAuthenticated } = useAdmin()
  
  // Track if component has mounted (hydration safe)
  const [isMounted, setIsMounted] = useState(false)
  
  // Initialize selectedStudio as empty string for SSR
  const [selectedStudio, setSelectedStudio] = useState('')
  
  const [studios, setStudios] = useState([])
  const [loadingStudios, setLoadingStudios] = useState(true)
  const [filteredData, setFilteredData] = useState({
    users: [],
    loadingUsers: true // Start as true to prevent flashes
  })

  // Load from localStorage after mount (hydration safe)
  useEffect(() => {
    setIsMounted(true)
    const savedStudio = localStorage.getItem('selectedStudio')
    if (savedStudio) {
      setSelectedStudio(savedStudio)
      // Keep loadingUsers true - will be handled by the data fetching useEffect
    } else {
      // No saved studio, so we can stop loading immediately
      setFilteredData({ users: [], loadingUsers: false })
    }
  }, [])

  // Custom setter that also updates localStorage
  const updateSelectedStudio = (studioId) => {
    setSelectedStudio(studioId)
    if (isMounted) {
      if (studioId) {
        localStorage.setItem('selectedStudio', studioId)
      } else {
        localStorage.removeItem('selectedStudio')
      }
    }
  }

  // Fetch studios when admin is authenticated
  useEffect(() => {
    if (!isAuthenticated || !adminInfo) return

    const fetchStudios = async () => {
      try {
        const response = await secureApiCall('/admin/studios')
       
        
        if (Array.isArray(response.data)) {
          setStudios(response.data)
        } else {
          console.error('Unexpected studios data format:', response.data)
          setStudios([])
        }
      } catch (error) {
        console.error("Error fetching studios:", error)
        console.error('Studios endpoint error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        })
        
        // If endpoint doesn't exist (404) or other server error, use mock data temporarily
        if (error.response?.status === 404 || error.response?.status === 500) {
          
          setStudios([
            { id: 'studio-1', name: 'Studio A', slug: 'studio-a' },
            { id: 'studio-2', name: 'Studio B', slug: 'studio-b' },
            { id: 'studio-3', name: 'Studio C', slug: 'studio-c' }
          ])
        } else {
          setStudios([])
        }
      } finally {
        setLoadingStudios(false)
      }
    }

    fetchStudios()
  }, [isAuthenticated, adminInfo, secureApiCall])

  // Fetch filtered data when studio selection changes
  useEffect(() => {
    if (!isAuthenticated || !adminInfo) {
      // Only set loadingUsers to false if we've mounted AND there's no selected studio
      // If there's a selected studio, keep loading until authentication is ready
      if (isMounted && !selectedStudio) {
        setFilteredData({ users: [], loadingUsers: false })
      }
      return
    }

    // If no studio is selected, don't fetch any data - show empty state
    if (!selectedStudio) {
      // Only set loadingUsers to false if we've mounted (checked localStorage) 
      if (isMounted) {
        setFilteredData({ users: [], loadingUsers: false })
      }
      return
    }

    const fetchFilteredUsers = async () => {
      setFilteredData(prev => ({ ...prev, loadingUsers: true }))
      
      try {
        // Fetch users with studio_id parameter as backend expects
        const endpoint = `/admin/users?studio_id=${selectedStudio}`
        
        const usersResponse = await secureApiCall(endpoint)
        
        
        
        // Backend should return filtered users directly
        const filteredUsers = Array.isArray(usersResponse.data) ? usersResponse.data : []
        
        setFilteredData({
          users: filteredUsers,
          loadingUsers: false
        })
      } catch (error) {
        console.error('Error fetching filtered users:', error)
        console.error('Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          endpoint: `/admin/users?studio_id=${selectedStudio}`,
          selectedStudio
        })
        setFilteredData({ users: [], loadingUsers: false })
      }
    }

    fetchFilteredUsers()
  }, [selectedStudio, isAuthenticated, adminInfo, secureApiCall, isMounted])

  const value = {
    selectedStudio,
    setSelectedStudio: updateSelectedStudio,
    studios,
    loadingStudios,
    filteredData,
    isMounted,
    refreshData: () => {
      // Force refresh of filtered data by triggering a re-fetch
      if (selectedStudio && isAuthenticated && adminInfo) {
        setFilteredData(prev => ({ ...prev, loadingUsers: true }))
        
        const fetchFilteredUsers = async () => {
          try {
            const endpoint = `/admin/users?studio_id=${selectedStudio}`
            const usersResponse = await secureApiCall(endpoint)
            const filteredUsers = Array.isArray(usersResponse.data) ? usersResponse.data : []
            
            setFilteredData({
              users: filteredUsers,
              loadingUsers: false
            })
          } catch (error) {
            console.error('Error refreshing filtered users:', error)
            setFilteredData({ users: [], loadingUsers: false })
          }
        }
        
        fetchFilteredUsers()
      }
    }
  }

  return (
    <StudioContext.Provider value={value}>
      {children}
    </StudioContext.Provider>
  )
}
