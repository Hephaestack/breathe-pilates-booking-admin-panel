"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const StudioContext = createContext()

export const useStudio = () => {
  const context = useContext(StudioContext)
  if (!context) {
    throw new Error('useStudio must be used within a StudioProvider')
  }
  return context
}

export const StudioProvider = ({ children }) => {
  const [selectedStudio, setSelectedStudio] = useState(null)
  const [studios, setStudios] = useState([])
  const [loadingStudios, setLoadingStudios] = useState(true)

  useEffect(() => {
    const fetchStudios = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/studios`,
          { withCredentials: true }
        )
        console.log('Studios API response (context):', response.data)
        
        // Handle both current backend format (array of strings) and future format (array of objects)
        if (Array.isArray(response.data)) {
          if (response.data.length > 0 && typeof response.data[0] === 'string') {
            // Current backend format: ["Studio Name 1", "Studio Name 2"]
            const studiosWithIds = response.data.map((name, index) => ({
              id: index.toString(), // Temporary ID until backend is fixed
              name: name
            }))
            console.log('Converted studios (context):', studiosWithIds)
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
        setStudios([])
      } finally {
        setLoadingStudios(false)
      }
    }

    fetchStudios()
  }, [])

  const value = {
    selectedStudio,
    setSelectedStudio,
    studios,
    loadingStudios
  }

  return (
    <StudioContext.Provider value={value}>
      {children}
    </StudioContext.Provider>
  )
}
