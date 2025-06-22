"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Calendar, MapPin, Trash2 } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { useFirebase } from "@/hooks/use-firebase"
import { toast } from "sonner"
import { MaintenanceRecord } from "@/lib/firebase-services"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"

function HistoryPageContent() {
  const { t } = useLanguage()
  const { records, loading, error, deleteRecord, searchRecords } = useFirebase()
  const { user } = useAuth()
  const [filteredRecords, setFilteredRecords] = useState<MaintenanceRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    setFilteredRecords(records)
  }, [records])

  useEffect(() => {
    const handleSearch = async () => {
      if (searchTerm.trim()) {
        setSearchLoading(true)
        try {
          await searchRecords(searchTerm)
        } finally {
          setSearchLoading(false)
        }
      } else {
        // Reset to all records when search is cleared
        setFilteredRecords(records)
      }
    }

    const timeoutId = setTimeout(handleSearch, 300) // Debounce search
    return () => clearTimeout(timeoutId)
  }, [searchTerm, searchRecords, records])

  const handleDeleteRecord = async (record: MaintenanceRecord) => {
    if (!record.id) return

    if (confirm(t("confirmDeleteRecord"))) {
      try {
        await deleteRecord(record.id, record.photo)
        toast.success(t("recordDeleted"))
      } catch (err) {
        toast.error(t("failedToDeleteRecord"))
        console.error("Error deleting record:", err)
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const months = [
      t("jan"),
      t("feb"),
      t("mar"),
      t("apr"),
      t("may"),
      t("jun"),
      t("jul"),
      t("aug"),
      t("sep"),
      t("oct"),
      t("nov"),
      t("dec"),
    ]

    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  const getKilometersSince = (currentKm: number, previousKm: number) => {
    return currentKm - previousKm
  }

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  // Debug information
  console.log('History Page Debug:', {
    user: user?.uid,
    recordsCount: records.length,
    loading,
    error,
    records: records.slice(0, 2) // Show first 2 records for debugging
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">{t("maintenanceHistory")}</h1>
        </div>

        {/* Debug Info - Remove this in production */}
        {process.env.NODE_ENV === 'development' && (
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-600">
                <div>User ID: {user?.uid || 'Not authenticated'}</div>
                <div>Records loaded: {records.length}</div>
                <div>Loading: {loading ? 'Yes' : 'No'}</div>
                {error && <div>Error: {error}</div>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t("searchByTags")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{records.length}</div>
              <div className="text-sm text-gray-600">{t("totalRecords")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {records.length > 0 ? records[0].kilometers.toLocaleString() : "0"}
              </div>
              <div className="text-sm text-gray-600">{t("latestKM")}</div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t("loadingRecords")}</p>
            </CardContent>
          </Card>
        )}

        {/* Records List */}
        {!loading && (
          <div className="space-y-4">
            {filteredRecords.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  {searchTerm ? t("noRecordsMatch") : t("noRecordsYet")}
                </CardContent>
              </Card>
            ) : (
              filteredRecords.map((record, index) => {
                const nextRecord = filteredRecords[index + 1]
                const kmSince = nextRecord ? getKilometersSince(record.kilometers, nextRecord.kilometers) : null

                return (
                  <Card key={record.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-semibold">{record.kilometers.toLocaleString()} km</span>
                          {kmSince && (
                            <Badge variant="outline" className="text-xs">
                              +{kmSince.toLocaleString()} km
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {formatDate(record.date)}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRecord(record)}
                            className="h-6 w-6 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {record.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Photo */}
                      {record.photo && (
                        <img
                          src={record.photo}
                          alt="Maintenance"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      )}

                      {/* Notes */}
                      {record.notes && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {record.notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryPageContent />
    </ProtectedRoute>
  )
}
