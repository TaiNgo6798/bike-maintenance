"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserProfile } from "@/components/auth/user-profile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { useFirebase } from "@/hooks/use-firebase"
import { useTags } from "@/hooks/use-tags"
import { MaintenanceRecord } from "@/types"
import { Camera, Gauge, History, Settings, Wrench } from "lucide-react"
import Link from "next/link"

function HomePageContent() {
  const { t } = useLanguage()
  const { records, loading } = useFirebase()
  const { userTags, loading: tagsLoading } = useTags()

  const getCurrentKilometers = (records: MaintenanceRecord[]) => {
    if (records.length === 0) return 0
    return Math.max(...records.map((r) => r.kilometers))
  }

  const getRecentRecords = () => {
    return records
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="h-8 w-8" />
              <h1 className="text-2xl font-bold">{t("appName")}</h1>
            </div>
            <UserProfile />
          </div>
          <p className="text-gray-600 text-left">{t("appDescription")}</p>
        </div>

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t("loading") || "Loading..."}</p>
            </CardContent>
          </Card>
        )}

        {/* Content - only show when not loading */}
        {!loading && !tagsLoading && (
          <>
            {/* Current Kilometers */}
            <Card>
              <CardHeader>
                <CardTitle>{t("currentKilometers")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center">
                  {getCurrentKilometers(records).toLocaleString()} km
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
                <CardTitle>{t("recentMaintenance")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getRecentRecords().length === 0 ? (
                  <p className="text-center text-gray-500 py-4">{t("noRecordsYet")}</p>
                ) : (
                  getRecentRecords().map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{record.kilometers.toLocaleString()} km</div>
                        <div className="text-sm text-gray-600">{new Date(record.date).toLocaleDateString()}</div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {record.tagIDs.map((tagID) => {
                          const tag = userTags.find((t) => t.id === tagID)
                          if (!tag) return null
                          return (
                            <Badge key={tagID} variant="secondary" className="text-xs">
                              {tag?.name}
                          </Badge>
                        )})}
                        {record.tagIDs.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{record.tagIDs.length - 2}
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
          </>
        )}
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
