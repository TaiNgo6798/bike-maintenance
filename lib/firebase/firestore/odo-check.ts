
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  where,
  limit,
} from 'firebase/firestore'
import { db } from '../client'
import { OdoCheckRecord } from '@/types'

// Constants
const ODO_CHECK_RECORDS_COLLECTION = 'odo-check-records'
const ERROR_INDEXED_QUERY = 'Error with indexed query, trying fallback:'
const ERROR_FALLBACK_QUERY = 'Fallback query also failed:'

// Add a new odometer check record
export const addOdoCheck = async (record: Omit<OdoCheckRecord, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(collection(db, ODO_CHECK_RECORDS_COLLECTION), {
    ...record,
    createdAt: Timestamp.now(),
  })
  return docRef.id
}

// Get the latest odometer check for a specific user
export const getLatestOdoCheck = async (userId: string): Promise<OdoCheckRecord | null> => {
  // Simple query without orderBy to avoid needing a composite index
  const q = query(
    collection(db, ODO_CHECK_RECORDS_COLLECTION),
    where('userId', '==', userId)
  )
  const querySnapshot = await getDocs(q)
  
  if (querySnapshot.empty) {
    return null
  }

  const records = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as OdoCheckRecord[]
  
  // Sort in JavaScript and return the latest
  records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return records[0]
}

// Get all odometer check records for a specific user
export const getOdoCheckHistory = async (userId: string): Promise<OdoCheckRecord[]> => {
  // Simple query without orderBy to avoid needing a composite index
  const q = query(
    collection(db, ODO_CHECK_RECORDS_COLLECTION),
    where('userId', '==', userId)
  )
  const querySnapshot = await getDocs(q)
  
  const records = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as OdoCheckRecord[]
  
  // Sort in JavaScript (most recent first)
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
