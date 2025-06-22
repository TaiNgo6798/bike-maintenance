"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, History, Settings, Bell, Wrench, Gauge } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { useFirebase } from "@/hooks/use-firebase"
import { MaintenanceRecord } from "@/lib/firebase-services"
import { toast } from "sonner"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserProfile } from "@/components/auth/user-profile"

function HomePageContent() {
  const { t } = useLanguage()
  const { records, loading, error } = useFirebase()
  const [overdueCount, setOverdueCount] = useState(0)

  useEffect(() => {
    // Check for overdue maintenance using tag intervals
    const tagIntervals = [
      { tag: "Oil Change", kilometers: 3000, days: 90, enabled: true },
      { tag: "Air Filter", kilometers: 6000, days: 180, enabled: true },
      { tag: "Spark Plug", kilometers: 8000, days: 365, enabled: true },
      { tag: "Chain Cleaning", kilometers: 1000, days: 30, enabled: true },
      { tag: "Brake Pads", kilometers: 15000, days: 730, enabled: true },
      { tag: "Tire Check", kilometers: 5000, days: 180, enabled: true },
      { tag: "Battery Check", kilometers: 10000, days: 365, enabled: true },
    ]

    const currentKm = getCurrentKilometers(records)
    const currentDate = new Date()

    let overdue = 0
    tagIntervals.forEach((interval: any) => {
      if (!interval.enabled) return

      const tagRecords = records
        .filter((record: MaintenanceRecord) => record.tags.includes(interval.tag))
        .sort((a: MaintenanceRecord, b: MaintenanceRecord) => new Date(b.date).getTime() - new Date(a.date).getTime())

      const lastMaintenance = tagRecords[0]

      if (lastMaintenance) {
        const kmSince = currentKm - lastMaintenance.kilometers
        const daysSince = Math.floor(
          (currentDate.getTime() - new Date(lastMaintenance.date).getTime()) / (1000 * 60 * 60 * 24),
        )

        if (
          (interval.kilometers && kmSince >= interval.kilometers) ||
          (interval.days && daysSince >= interval.days)
        ) {
          overdue++
        }
      } else if (currentKm > 0) {
        // No maintenance record for this tag - consider overdue if we have any mileage
        overdue++
      }
    })

    setOverdueCount(overdue)
  }, [records])

  const getCurrentKilometers = (records: MaintenanceRecord[]) => {
    if (records.length === 0) return 0
    return Math.max(...records.map((r) => r.kilometers))
  }

  const getRecentRecords = () => {
    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3)
  }

  const currentKm = getCurrentKilometers(records)

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
        <div className="text-center space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold">{t("appName")}</h1>
            </div>
            <UserProfile />
          </div>
          <p className="text-gray-600">{t("appDescription")}</p>
        </div>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t("currentStatus")}
              {overdueCount > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Bell className="h-3 w-3" />
                  {overdueCount} {t("due")}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{currentKm.toLocaleString()}</div>
              <div className="text-sm text-gray-600">{t("currentKilometers")}</div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/add-maintenance">
            <Button className="w-full h-20 flex flex-col gap-2">
              <Camera className="h-5 w-5" />
              <span className="text-xs">{t("addRecord")}</span>
            </Button>
          </Link>
          <Link href="/track">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <Gauge className="h-5 w-5" />
              <span className="text-xs">{t("checkStatus")}</span>
            </Button>
          </Link>
          <Link href="/history">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
              <History className="h-5 w-5" />
              <span className="text-xs">{t("history")}</span>
            </Button>
          </Link>
        </div>

        {/* Recent Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t("recentMaintenance")}
              <Link href="/history">
                <Button variant="ghost" size="sm">
                  {t("viewAll")}
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{t("loadingRecords")}</p>
              </div>
            ) : getRecentRecords().length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Wrench className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>{t("noRecordsYet")}</p>
                <p className="text-sm">{t("addFirstRecord")}</p>
              </div>
            ) : (
              getRecentRecords().map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{record.kilometers.toLocaleString()} km</div>
                    <div className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {record.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {record.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{record.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Settings Link */}
        <Link href="/settings">
          <Button variant="outline" className="w-full flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t("settingsIntervals")}
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomePageContent />
    </ProtectedRoute>
  )
}
