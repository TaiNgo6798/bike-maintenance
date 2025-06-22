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
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from './firebase'
import { MaintenanceRecord, TagInterval } from '@/types'

// Upload image to Firebase Storage
export const uploadImage = async (file: File, recordId: string): Promise<string> => {
  const storageRef = ref(storage, `maintenance-images/${recordId}/${file.name}`)
  const snapshot = await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(snapshot.ref)
  return downloadURL
}

// Delete image from Firebase Storage
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl)
    await deleteObject(imageRef)
  } catch (error) {
    console.error('Error deleting image:', error)
  }
}

// Add a new maintenance record
export const addMaintenanceRecord = async (record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'maintenance-records'), {
    ...record,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
  return docRef.id
}

// Get all maintenance records for a specific user
export const getMaintenanceRecords = async (userId: string): Promise<MaintenanceRecord[]> => {
  try {
    // Try with composite index first
    const q = query(
      collection(db, 'maintenance-records'), 
      where('userId', '==', userId),
      orderBy('date', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as MaintenanceRecord[]
  } catch (error: any) {
    console.error('Error with indexed query, trying fallback:', error)
    
    // Fallback: query without orderBy (no composite index needed)
    try {
      const fallbackQuery = query(
        collection(db, 'maintenance-records'), 
        where('userId', '==', userId)
      )
      const querySnapshot = await getDocs(fallbackQuery)
      
      const records = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as MaintenanceRecord[]
      
      // Sort in JavaScript
      return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError)
      throw fallbackError
    }
  }
}

// Delete a maintenance record
export const deleteMaintenanceRecord = async (recordId: string, imageUrl?: string): Promise<void> => {
  // Delete the image if it exists
  if (imageUrl) {
    await deleteImage(imageUrl)
  }
  
  // Delete the document
  await deleteDoc(doc(db, 'maintenance-records', recordId))
}

// Update a maintenance record
export const updateMaintenanceRecord = async (
  recordId: string, 
  updates: Partial<Omit<MaintenanceRecord, 'id' | 'createdAt'>>
): Promise<void> => {
  await updateDoc(doc(db, 'maintenance-records', recordId), {
    ...updates,
    updatedAt: Timestamp.now(),
  })
}

// Search maintenance records for a specific user
export const searchMaintenanceRecords = async (searchTerm: string, userId: string): Promise<MaintenanceRecord[]> => {
  try {
    // Try with composite index first
    const q = query(
      collection(db, 'maintenance-records'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    const records = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as MaintenanceRecord[]
    
    return records.filter((record: MaintenanceRecord) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        record.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        record.notes?.toLowerCase().includes(searchLower)
      )
    })
  } catch (error: any) {
    console.error('Error with indexed search query, trying fallback:', error)
    
    // Fallback: query without orderBy (no composite index needed)
    try {
      const fallbackQuery = query(
        collection(db, 'maintenance-records'),
        where('userId', '==', userId)
      )
      const querySnapshot = await getDocs(fallbackQuery)
      
      const records = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as MaintenanceRecord[]
      
      // Sort in JavaScript and then filter
      const sortedRecords = records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      return sortedRecords.filter((record: MaintenanceRecord) => {
        const searchLower = searchTerm.toLowerCase()
        return (
          record.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
          record.notes?.toLowerCase().includes(searchLower)
        )
      })
    } catch (fallbackError) {
      console.error('Fallback search query also failed:', fallbackError)
      throw fallbackError
    }
  }
}

// Tag Management Functions

// Add a new tag interval
export const addTagInterval = async (tagInterval: Omit<TagInterval, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'tag-intervals'), {
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
      collection(db, 'tag-intervals'),
      where('userId', '==', userId),
      orderBy('tag', 'asc')
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as TagInterval[]
  } catch (error: any) {
    console.error('Error fetching tag intervals:', error)
    
    // Fallback: query without orderBy
    try {
      const fallbackQuery = query(
        collection(db, 'tag-intervals'),
        where('userId', '==', userId)
      )
      const querySnapshot = await getDocs(fallbackQuery)
      
      const tagIntervals = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as TagInterval[]
      
      // Sort in JavaScript
      return tagIntervals.sort((a, b) => a.tag.localeCompare(b.tag))
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError)
      throw fallbackError
    }
  }
}

// Update a tag interval
export const updateTagInterval = async (
  tagIntervalId: string,
  updates: Partial<Omit<TagInterval, 'id' | 'createdAt' | 'userId'>>
): Promise<void> => {
  await updateDoc(doc(db, 'tag-intervals', tagIntervalId), {
    ...updates,
    updatedAt: Timestamp.now(),
  })
}

// Delete a tag interval
export const deleteTagInterval = async (tagIntervalId: string): Promise<void> => {
  await deleteDoc(doc(db, 'tag-intervals', tagIntervalId))
}

// Get all unique tags for a user (for autocomplete/suggestions)
export const getUserTags = async (userId: string): Promise<string[]> => {
  try {
    const tagIntervals = await getTagIntervals(userId)
    return tagIntervals.map(tagInterval => tagInterval.tag)
  } catch (error) {
    console.error('Error fetching user tags:', error)
    return []
  }
} 