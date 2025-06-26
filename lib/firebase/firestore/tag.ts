import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
  where,
} from 'firebase/firestore'
import { db } from '../client'
import { TagInterval } from '@/types'

// Constants
const TAG_INTERVALS_COLLECTION = 'tag-intervals'
const ERROR_FETCHING_TAG_INTERVALS = 'Error fetching tag intervals:'
const ERROR_FALLBACK_QUERY = 'Fallback query also failed:'

// Add a new tag interval
export const addTagInterval = async (tagInterval: Omit<TagInterval, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, TAG_INTERVALS_COLLECTION), {
    ...tagInterval,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return docRef.id
}

// Get all tag intervals for a specific user
export const getTagIntervals = async (userId: string): Promise<TagInterval[]> => {
  try {
    const q = query(
      collection(db, TAG_INTERVALS_COLLECTION),
      where('userId', '==', userId),
      orderBy('name', 'asc')
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as TagInterval[]
  } catch (error: any) {
    console.error(ERROR_FETCHING_TAG_INTERVALS, error)
    
    // Fallback: query without orderBy
    try {
      const fallbackQuery = query(
        collection(db, TAG_INTERVALS_COLLECTION),
        where('userId', '==', userId)
      )
      const querySnapshot = await getDocs(fallbackQuery)
      
      const tagIntervals = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as TagInterval[]
      
      // Sort in JavaScript
      return tagIntervals.sort((a, b) => a.id!.localeCompare(b.id!))
    } catch (fallbackError) {
      console.error(ERROR_FALLBACK_QUERY, fallbackError)
      throw fallbackError
    }
  }
}

// Update a tag interval
export const updateTagInterval = async (
  tagIntervalId: string,
  updates: Partial<Omit<TagInterval, 'id' | 'createdAt' | 'userId'>>
): Promise<void> => {
  await updateDoc(doc(db, TAG_INTERVALS_COLLECTION, tagIntervalId), {
    ...updates,
    updatedAt: Timestamp.now(),
  })
}

// Delete a tag interval
export const deleteTagInterval = async (tagIntervalId: string): Promise<void> => {
  await deleteDoc(doc(db, TAG_INTERVALS_COLLECTION, tagIntervalId))
}

// Get all unique tags for a user (for autocomplete/suggestions)
export const getUserTags = async (userId: string): Promise<TagInterval[]> => {
  try {
    const tagIntervals = await getTagIntervals(userId)
    return tagIntervals
  } catch (error) {
    console.error(ERROR_FETCHING_TAG_INTERVALS, error)
    return []
  }
} 