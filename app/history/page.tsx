"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Calendar, MapPin } from "lucide-react"
import Link from "next/link"

interface MaintenanceRecord {
  id: string
  date: string
  kilometers: number
  tags: string[]
  photo?: string
  notes?: string
}

export default function HistoryPage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<MaintenanceRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const savedRecords = JSON.parse(localStorage.getItem("maintenance-records") || "[]")
    const sortedRecords = savedRecords.sort(
      (a: MaintenanceRecord, b: MaintenanceRecord) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    setRecords(sortedRecords)
    setFilteredRecords(sortedRecords)
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = records.filter(
        (record) =>
          record.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
          record.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredRecords(filtered)
    } else {
      setFilteredRecords(records)
    }
  }, [searchTerm, records])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getKilometersSince = (currentKm: number, previousKm: number) => {
    return currentKm - previousKm
  }

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
          <h1 className="text-xl font-bold">Maintenance History</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by tags or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{records.length}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {records.length > 0 ? records[0].kilometers.toLocaleString() : "0"}
              </div>
              <div className="text-sm text-gray-600">Latest KM</div>
            </CardContent>
          </Card>
        </div>

        {/* Records List */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                {searchTerm ? "No records match your search" : "No maintenance records yet"}
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
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(record.date)}
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
                        src={record.photo || "/placeholder.svg"}
                        alt="Maintenance record"
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )}

                    {/* Notes */}
                    {record.notes && <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{record.notes}</div>}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
