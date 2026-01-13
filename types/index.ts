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

export interface OdoCheckResult {
    tagId?: string
    tagName: string
    status: "overdue" | "due-soon" | "ok"
    kmUntilDue?: number
    daysUntilDue?: number
}

export interface OdoCheckRecord {
    id?: string
    userId: string
    date: string // ISO date string
    kilometers: number
    results: OdoCheckResult[] // Snapshot of maintenance status at this check
    createdAt?: Timestamp
}