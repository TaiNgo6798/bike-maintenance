import { useState, useEffect } from 'react'
import {
  addTagInterval,
  getTagIntervals,
  updateTagInterval,
  deleteTagInterval,
  getUserTags,
} from '@/lib/firebase/firestore'
import { useAuth } from '@/contexts/auth-context'
import { cleanUndefinedValues } from '@/lib/utils'
import { TagInterval } from '@/types'

export const useTagQuery = () => {
  const [tagIntervals, setTagIntervals] = useState<TagInterval[]>([])
  const [userTags, setUserTags] = useState<TagInterval[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Load all tag intervals for the current user
  const loadTagIntervals = async () => {
    if (!user) {
      setTagIntervals([])
      setUserTags([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await getTagIntervals(user.uid)
      setTagIntervals(data)
      
      // Also load user tags for suggestions
      const tags = await getUserTags(user.uid)
      setUserTags(tags)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tag intervals')
    } finally {
      setLoading(false)
    }
  }

  // Add new tag interval
  const addTag = async (tagInterval: Omit<TagInterval, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) {
      throw new Error('User must be authenticated to add tags')
    }

    setLoading(true)
    setError(null)
    try {
      const cleanedTagInterval = cleanUndefinedValues(tagInterval)
      const tagIntervalWithUserId = {
        ...cleanedTagInterval,
        userId: user.uid,
      }
      const tagId = await addTagInterval(tagIntervalWithUserId)
      
      // Reload tag intervals
      await loadTagIntervals()
      return tagId
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tag')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update tag interval
  const updateTag = async (tagIntervalId: string, updates: Partial<Omit<TagInterval, 'id' | 'createdAt' | 'userId'>>) => {
    setLoading(true)
    setError(null)
    try {
      const cleanedUpdates = cleanUndefinedValues(updates)
      await updateTagInterval(tagIntervalId, cleanedUpdates)
      await loadTagIntervals()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tag')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete tag interval
  const deleteTag = async (tagIntervalId: string) => {
    setLoading(true)
    setError(null)
    try {
      await deleteTagInterval(tagIntervalId)
      await loadTagIntervals()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete tag')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Get enabled tag intervals (for maintenance reminders)
  const getEnabledTagIntervals = () => {
    return tagIntervals.filter(tag => tag.enabled)
  }

  // Load tag intervals when user changes
  useEffect(() => {
    loadTagIntervals()
  }, [user])

  return {
    tagIntervals,
    userTags,
    loading,
    error,
    addTag,
    updateTag,
    deleteTag,
    loadTagIntervals,
    getEnabledTagIntervals,
  }
} 