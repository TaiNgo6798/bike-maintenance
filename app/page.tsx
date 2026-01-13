"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserProfile } from "@/components/auth/user-profile"
import { useAuth } from "@/contexts/auth-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/contexts/locale/language-context"
import { useMantenanceQuery } from "@/hooks/use-mantenance-query"
import { useTagQuery } from "@/hooks/use-tag-query"
import { addOdoCheck } from "@/lib/firebase/firestore/odo-check"
import { APP_VERSION } from "@/lib/version"
import { MaintenanceRecord, MaintenanceStatus, OdoCheckRecord, OdoCheckResult } from "@/types"
import { AlertTriangle, Camera, CheckCircle, Clock, History } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

function HomePageContent() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { records, loading } = useMantenanceQuery()
  const { userTags, loading: tagsLoading, getEnabledTagIntervals } = useTagQuery()
  const [currentKm, setCurrentKm] = useState("")
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus[]>([])

  const getLatestMantenanceOdo = (records: MaintenanceRecord[]) => {
    if (records.length === 0) return 0
    return Math.max(...records.map((r) => r.kilometers))
  }

  const getRecentMantenanceRecords = () => {
    return records
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
  }

  const getNextMaintenanceInfo = () => {
    const latestOdo = getLatestMantenanceOdo(records)
    const enabledTags = getEnabledTagIntervals()
    
    return enabledTags.map((tag) => {
      // Find the most recent maintenance for this tag
      const tagRecords = records
        .filter((record) => record.tagIDs.includes(tag.id!))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      const lastMaintenance = tagRecords[0]
      
      if (!lastMaintenance || !tag.kilometers) {
        return null
      }

      const kmSinceLastMaintenance = latestOdo - lastMaintenance.kilometers
      const nextMaintenanceOdo = lastMaintenance.kilometers + tag.kilometers
      const kmUntilNext = nextMaintenanceOdo - latestOdo

      return {
        tag,
        lastMaintenance,
        nextMaintenanceOdo,
        kmUntilNext,
        kmSinceLastMaintenance
      }
    }).filter((info): info is NonNullable<typeof info> => info !== null)
    .sort((a, b) => a.kmUntilNext - b.kmUntilNext)
  }

  const analyzeMaintenanceStatus = (currentKilometers: number) => {
    const tagIntervals = getEnabledTagIntervals()
    const currentDate = new Date()

    const statusList: MaintenanceStatus[] = []

    tagIntervals.forEach((interval) => {
      if (!interval.enabled) return

      // Find the most recent maintenance for this tag
      const tagRecords = records
        .filter((record) => record.tagIDs.includes(interval.id!))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      const lastMaintenance = tagRecords[0]
      if(!lastMaintenance) return
      
      
      let kmSinceLastMaintenance = 0
      let daysSinceLastMaintenance = 0
      let kmUntilDue: number | undefined
      let daysUntilDue: number | undefined
      let status: "overdue" | "due-soon" | "ok" = "ok"

      if (lastMaintenance) {
        kmSinceLastMaintenance = currentKilometers - lastMaintenance.kilometers
        daysSinceLastMaintenance = Math.floor(
          (currentDate.getTime() - new Date(lastMaintenance.date).getTime()) / (1000 * 60 * 60 * 24),
        )

        // Check kilometers
        if (interval.kilometers) {
          kmUntilDue = interval.kilometers - kmSinceLastMaintenance
          if (kmUntilDue <= 0) {
            status = "overdue"
          } else if (kmUntilDue <= interval.kilometers * 0.1) {
            // 10% threshold
            status = "due-soon"
          }
        }

        // Check days
        if (interval.days) {
          daysUntilDue = interval.days - daysSinceLastMaintenance
          if (daysUntilDue <= 0) {
            status = "overdue"
          } else if (daysUntilDue <= interval.days * 0.1) {
            // 10% threshold
            if (status !== "overdue") status = "due-soon"
          }
        }
      } else {
        // No previous maintenance - consider overdue
        status = "overdue"
        kmSinceLastMaintenance = currentKilometers
        daysSinceLastMaintenance = 999 // Large number to indicate never done
      }

      statusList.push({
        tag: interval.name,
        lastMaintenance,
        kmSinceLastMaintenance,
        daysSinceLastMaintenance,
        kmUntilDue,
        daysUntilDue,
        status,
        interval,
      })
    })

    // Sort by priority first, then by kmUntilDue
    statusList.sort((a, b) => {
      const priority = { overdue: 0, "due-soon": 1, ok: 2 }
      const statusDiff = priority[a.status] - priority[b.status]
      
      // If statuses are different, sort by status priority
      if (statusDiff !== 0) {
        return statusDiff
      }
      
      // If statuses are the same, sort by kmUntilDue
      return (a.kmUntilDue || 0) - (b.kmUntilDue || 0)
    })

    setMaintenanceStatus(statusList)

    // Save the odometer check to history (only if we have a user)
    if (user) {
      const odoCheckResults: OdoCheckResult[] = statusList.map(s => {
        const result: OdoCheckResult = {
          tagId: s.interval.id,
          tagName: s.tag,
          status: s.status,
        }
        // Only include defined values (Firestore doesn't allow undefined)
        if (s.kmUntilDue !== undefined) result.kmUntilDue = s.kmUntilDue
        if (s.daysUntilDue !== undefined) result.daysUntilDue = s.daysUntilDue
        return result
      })

      addOdoCheck({
        userId: user.uid,
        date: new Date().toISOString(),
        kilometers: currentKilometers,
        results: odoCheckResults
      }).catch(err => console.error("Failed to save odo check", err))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "overdue":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "due-soon":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue":
        return "border-red-200 bg-red-50"
      case "due-soon":
        return "border-yellow-200 bg-yellow-50"
      default:
        return "border-green-200 bg-green-50"
    }
  }

  const getProgressValue = (status: MaintenanceStatus) => {
    if (!status.interval.kilometers || !status.lastMaintenance) return 0

    const progress = (status.kmSinceLastMaintenance / status.interval.kilometers) * 100
    return Math.min(progress, 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "overdue":
        return t("overdue")
      case "due-soon":
        return t("dueSoon")
      default:
        return t("ok")
    }
  }

  const handleCheckAgain = () => {
    setCurrentKm("")
    setMaintenanceStatus([])
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/icons/icon.svg"
                alt="Bike Maintenance Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <div className="flex flex-col items-start">
                <h1 className="text-2xl font-bold">{t("appName")}</h1>
                <p className="text-xs text-gray-500">v{APP_VERSION}</p>
              </div>
            </div>
            <UserProfile />
          </div>
        </div>

        {/* Loading State */}
        {loading && tagsLoading && (
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
            {/* Latest Maintenance ODO */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-center">{t("latestKM")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center text-blue-600">
                  {getLatestMantenanceOdo(records).toLocaleString()} km
                </div>
                {/* Next maintenance info */}
                <div className="mt-10 space-y-2">
                  <h2 className="text-md font-bold text-left">{t("nextMaintenance")}</h2>
                  {getNextMaintenanceInfo().length === 0 ? (
                    <p className="text-sm text-gray-500 text-center">{t("noMaintenanceScheduled") || "No maintenance scheduled"}</p>
                  ) : (
                    getNextMaintenanceInfo().map((info) => (
                      <div key={info.tag.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <span className="font-medium">{info.tag.name}</span>
                        <span className="font-semibold text-green-600">
                          {info.nextMaintenanceOdo.toLocaleString()} km
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Track Maintenance Status */}
            <Card>
              <CardHeader>
                <CardTitle>{t("maintenanceCheck")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {maintenanceStatus.length === 0 ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="manual-km"
                        type="number"
                        inputMode="numeric"
                        value={currentKm}
                        onChange={(e) => setCurrentKm(e.target.value)}
                        placeholder={t("currentKilometers")}
                      />
                      <Button 
                        onClick={() => analyzeMaintenanceStatus(Number.parseInt(currentKm))} 
                        disabled={!currentKm}
                      >
                        {t("check")}
                      </Button>
                    </div>
                    <div className="flex justify-end">
                      <Link href="/odo-checks">
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                          <History className="mr-2 h-3 w-3" />
                          {t("viewHistory") || "View Check History"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{Number.parseInt(currentKm).toLocaleString()}</div>
                      <div className="text-sm text-gray-600">{t("km")}</div>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">{t("maintenanceStatus")}</h2>

                      {maintenanceStatus.length === 0 ? (
                        <Card>
                          <CardContent className="p-8 text-center text-gray-500">
                            <p>{t("noTagsConfigured")}</p>
                            <p className="text-sm mt-2">{t("configureTagsInSettings")}</p>
                            <Link href="/settings">
                              <Button variant="outline" className="mt-4">
                                {t("goToSettings")}
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ) : (
                        maintenanceStatus.map((status) => (
                          <Card key={status.tag} className={`border-2 ${getStatusColor(status.status)}`}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(status.status)}
                                  <span className="font-medium">{status.tag}</span>
                                </div>
                                <Badge
                                  variant={
                                    status.status === "overdue"
                                      ? "destructive"
                                      : status.status === "due-soon"
                                        ? "default"
                                        : "secondary"
                                  }
                                >
                                  {getStatusText(status.status)}
                                </Badge>
                              </div>

                              {status.lastMaintenance ? (
                                <div className="space-y-2">
                                  <div className="text-sm text-gray-600">
                                    {t("last")}: {status.lastMaintenance.kilometers.toLocaleString()} km (
                                    {formatDate(status.lastMaintenance.date)})
                                  </div>

                                  {status.interval.kilometers && (
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-sm">
                                        <span>
                                          {t("distance")}: {status.kmSinceLastMaintenance.toLocaleString()} km
                                        </span>
                                        <span>
                                        {t("interval")}: {status.interval.kilometers.toLocaleString()} km
                                        </span>
                                      </div>
                                      <Progress value={getProgressValue(status)} className="h-2" />
                                      {status.kmUntilDue !== undefined && (
                                        <div className="text-xs text-gray-500">
                                          {status.kmUntilDue > 0
                                            ? `${status.kmUntilDue.toLocaleString()} km ${t("remaining")}`
                                            : `${t("overdue")}: ${Math.abs(status.kmUntilDue).toLocaleString()} km`}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {status.interval.days ? (
                                    <div className="text-sm text-gray-600">
                                      {t("days")}: {status.daysSinceLastMaintenance} / {status.interval.days}
                                      {status.daysUntilDue && (
                                        <span className="ml-2">
                                          (
                                          {status.daysUntilDue > 0
                                            ? `${status.daysUntilDue} ${t("daysLeft")}`
                                            : `${Math.abs(status.daysUntilDue)} ${t("daysOverdue")}`}
                                          )
                                        </span>
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                              ) : (
                                <div className="text-sm text-gray-600">{t("noPreviousMaintenance")}</div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>

                    <Button variant="outline" onClick={handleCheckAgain} className="w-full">
                      {t("checkAgain")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/add-maintenance">
                <Button className="w-full h-20 flex flex-col gap-2">
                  <Camera className="h-5 w-5" />
                  <span className="text-xs">{t("addRecord")}</span>
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
                <CardTitle className="text-lg text-center">{t("recentMaintenance")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getRecentMantenanceRecords().length === 0 ? (
                  <p className="text-center text-gray-500 py-4">{t("noRecordsYet")}</p>
                ) : (
                  getRecentMantenanceRecords().map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-blue-600">{record.kilometers.toLocaleString()} km</div>
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
