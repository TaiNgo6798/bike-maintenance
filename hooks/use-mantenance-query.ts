import { useState, useEffect } from 'react'
import {
  addMaintenanceRecord,
  getMaintenanceRecords,
  deleteMaintenanceRecord,
  updateMaintenanceRecord,
  searchMaintenanceRecords,
  uploadImage,
} from '@/lib/firebase/firestore'
import { useAuth } from '@/contexts/auth-context'
import { cleanUndefinedValues } from '@/lib/utils'
import { MaintenanceRecord } from '@/types'

export const useMantenanceQuery = () => {
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Load all records for the current user
  const loadRecords = async () => {
    if (!user) {
      setRecords([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await getMaintenanceRecords(user.uid)
      setRecords(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load records')
    } finally {
      setLoading(false)
    }
  }

  // Add new record
  const addRecord = async (record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt' | 'userId'>, photoFile?: File) => {
    if (!user) {
      throw new Error('User must be authenticated to add records')
    }

    setLoading(true)
    setError(null)
    try {
      const cleanedRecord = cleanUndefinedValues(record)
      const recordWithUserId = {
        ...cleanedRecord,
        userId: user.uid,
      }
      const recordId = await addMaintenanceRecord(recordWithUserId)
      
      // Upload photo if provided
      if (photoFile) {
        const photoUrl = await uploadImage(photoFile, recordId)
        await updateMaintenanceRecord(recordId, { photo: photoUrl })
      }
      
      // Reload records
      await loadRecords()
      return recordId
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add record')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete record
  const deleteRecord = async (recordId: string, imageUrl?: string) => {
    setLoading(true)
    setError(null)
    try {
      await deleteMaintenanceRecord(recordId, imageUrl)
      await loadRecords()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update record
  const updateRecord = async (recordId: string, updates: Partial<Omit<MaintenanceRecord, 'id' | 'createdAt' | 'userId'>>) => {
    setLoading(true)
    setError(null)
    try {
      const cleanedUpdates = cleanUndefinedValues(updates)
      await updateMaintenanceRecord(recordId, cleanedUpdates)
      await loadRecords()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update record')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Search records for the current user
  const searchRecords = async (searchTerm: string) => {
    if (!user) {
      setRecords([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await searchMaintenanceRecords(searchTerm, user.uid)
      setRecords(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search records')
    } finally {
      setLoading(false)
    }
  }

  // Load records when user changes
  useEffect(() => {
    loadRecords()
  }, [user])

  return {
    records,
    loading,
    error,
    addRecord,
    deleteRecord,
    updateRecord,
    searchRecords,
    loadRecords,
  }
} 