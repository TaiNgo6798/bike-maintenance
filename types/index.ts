import { Timestamp } from "firebase/firestore"

export interface MaintenanceRecord {
    id?: string
    userId: string
    date: string
    kilometers: number
    tagIDs: string[]
    photo?: string
    notes?: string
    createdAt?: Timestamp
    updatedAt?: Timestamp
}

export interface MaintenanceStatus {
    tag: string
    lastMaintenance?: MaintenanceRecord
    kmSinceLastMaintenance: number
    daysSinceLastMaintenance: number
    kmUntilDue?: number
    daysUntilDue?: number
    status: "overdue" | "due-soon" | "ok"
    interval: TagInterval
}

export interface TagInterval {
    id?: string
    userId: string
    name: string
    kilometers?: number
    days?: number
    enabled: boolean
    createdAt?: Timestamp
    updatedAt?: Timestamp
}