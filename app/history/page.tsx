"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/locale/language-context"
import { useMantenanceQuery } from "@/hooks/use-mantenance-query"
import { useTagQuery } from "@/hooks/use-tag-query"
import { MaintenanceRecord } from "@/types"
import { ArrowLeft, Calendar, MapPin, Trash2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

function HistoryPageContent() {
  const { t } = useLanguage()
  const { records, loading, error, deleteRecord } = useMantenanceQuery()
  const { userTags, loading: tagsLoading } = useTagQuery()
  const { user } = useAuth()
  const [filteredRecords, setFilteredRecords] = useState<MaintenanceRecord[]>([])
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    setFilteredRecords(records)
  }, [records])


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
        {/* <div className="relative">
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
        </div> */}

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{records.length}</div>
              <div className="text-sm text-gray-600">{t("totalRecords")}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
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
        {!loading && !tagsLoading && (
          <div className="space-y-4">
            {filteredRecords.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  {t("noRecordsYet")}
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
                          <span className="font-semibold text-blue-600">{record.kilometers.toLocaleString()} km</span>
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
                        {record.tagIDs.map((tagID) => {
                          const tag = userTags.find((t) => t.id === tagID)
                          if (!tag) return null
                          return (
                            <Badge key={tagID} variant="secondary" className="text-xs">
                              {tag?.name}
                          </Badge>
                        )})}
                      </div>

                      {/* Photo */}
                      {record.photo && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="relative group">
                              <img
                                src={record.photo}
                                alt="Maintenance"
                                className="w-full h-32 object-cover rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 rounded-full p-2">
                                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent 
                            className="max-w-6xl max-h-[95vh] p-0 bg-black/95 backdrop-blur-sm border-0"
                            onOpenAutoFocus={() => {
                              setZoomLevel(1)
                              setRotation(0)
                            }}
                          >
                            <DialogHeader className="absolute top-2 left-2 z-10 bg-black/50 backdrop-blur-sm rounded-lg p-2 text-white">
                              <DialogTitle className="text-sm font-medium">
                                {formatDate(record.date)} • {record.kilometers.toLocaleString()} km
                              </DialogTitle>
                            </DialogHeader>
                            
                            <div className="absolute top-2 right-2 z-10 flex gap-1">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70 h-8 w-8 p-0"
                                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                              >
                                <ZoomOut className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70 h-8 w-8 p-0"
                                onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                              >
                                <ZoomIn className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-black/70 h-8 w-8 p-0"
                                onClick={() => setRotation((rotation + 90) % 360)}
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            </div>

                            <div 
                              className="relative overflow-hidden"
                              onKeyDown={(e) => {
                                if (e.key === '+' || e.key === '=') {
                                  setZoomLevel(Math.min(3, zoomLevel + 0.25))
                                } else if (e.key === '-') {
                                  setZoomLevel(Math.max(0.5, zoomLevel - 0.25))
                                } else if (e.key === 'r' || e.key === 'R') {
                                  setRotation((rotation + 90) % 360)
                                }
                              }}
                              tabIndex={0}
                            >
                              <img
                                src={record.photo}
                                alt="Maintenance"
                                className="w-full h-auto max-h-[95vh] object-contain rounded-lg transition-all duration-300 ease-in-out cursor-grab active:cursor-grabbing"
                                style={{
                                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                                  transformOrigin: 'center center'
                                }}
                                draggable={false}
                              />
                              <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg p-2 text-white">
                                <div className="flex flex-wrap gap-1 mb-1">
                                  {record.tagIDs.map((tagID) => {
                                    const tag = userTags.find((t) => t.id === tagID)
                                    if (!tag) return null
                                    return (
                                      <Badge key={tagID} variant="secondary" className="text-xs bg-white/20 text-white border-white/30 px-1 py-0">
                                        {tag?.name}
                                      </Badge>
                                    )
                                  })}
                                </div>
                                {record.notes && (
                                  <p className="text-xs text-gray-200 mb-1">{record.notes}</p>
                                )}
                                <div className="text-xs text-gray-300">
                                  {Math.round(zoomLevel * 100)}% • +/-: zoom • R: rotate
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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
