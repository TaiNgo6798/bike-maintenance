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
import { db, storage } from '../client'
import { MaintenanceRecord } from '@/types'

// Constants
const MAINTENANCE_RECORDS_COLLECTION = 'maintenance-records'
const MAINTENANCE_IMAGES_STORAGE_PATH = 'maintenance-images'
const ERROR_DELETING_IMAGE = 'Error deleting image:'
const ERROR_INDEXED_QUERY = 'Error with indexed query, trying fallback:'
const ERROR_FALLBACK_QUERY = 'Fallback query also failed:'
const ERROR_INDEXED_SEARCH_QUERY = 'Error with indexed search query, trying fallback:'
const ERROR_FALLBACK_SEARCH_QUERY = 'Fallback search query also failed:'

// Upload image to Firebase Storage
export const uploadImage = async (file: File, recordId: string): Promise<string> => {
  const storageRef = ref(storage, `${MAINTENANCE_IMAGES_STORAGE_PATH}/${recordId}/${file.name}`)
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
    console.error(ERROR_DELETING_IMAGE, error)
  }
}

// Add a new maintenance record
export const addMaintenanceRecord = async (record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, MAINTENANCE_RECORDS_COLLECTION), {
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
      collection(db, MAINTENANCE_RECORDS_COLLECTION), 
      where('userId', '==', userId),
      orderBy('date', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as MaintenanceRecord[]
  } catch (error: any) {
    console.error(ERROR_INDEXED_QUERY, error)
    
    // Fallback: query without orderBy (no composite index needed)
    try {
      const fallbackQuery = query(
        collection(db, MAINTENANCE_RECORDS_COLLECTION), 
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
      console.error(ERROR_FALLBACK_QUERY, fallbackError)
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
  await deleteDoc(doc(db, MAINTENANCE_RECORDS_COLLECTION, recordId))
}

// Update a maintenance record
export const updateMaintenanceRecord = async (
  recordId: string, 
  updates: Partial<Omit<MaintenanceRecord, 'id' | 'createdAt'>>
): Promise<void> => {
  await updateDoc(doc(db, MAINTENANCE_RECORDS_COLLECTION, recordId), {
    ...updates,
    updatedAt: Timestamp.now(),
  })
}

// Search maintenance records for a specific user
export const searchMaintenanceRecords = async (searchTerm: string, userId: string): Promise<MaintenanceRecord[]> => {
  try {
    // Try with composite index first
    const q = query(
      collection(db, MAINTENANCE_RECORDS_COLLECTION),
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
        record.tagIDs.some(tag => tag.toLowerCase().includes(searchLower)) ||
        record.notes?.toLowerCase().includes(searchLower)
      )
    })
  } catch (error: any) {
    console.error(ERROR_INDEXED_SEARCH_QUERY, error)
    
    // Fallback: query without orderBy (no composite index needed)
    try {
      const fallbackQuery = query(
        collection(db, MAINTENANCE_RECORDS_COLLECTION),
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
          record.tagIDs.some(tag => tag.toLowerCase().includes(searchLower)) ||
          record.notes?.toLowerCase().includes(searchLower)
        )
      })
    } catch (fallbackError) {
      console.error(ERROR_FALLBACK_SEARCH_QUERY, fallbackError)
      throw fallbackError
    }
  }
} 