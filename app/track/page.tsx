"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/contexts/locale/language-context"
import { useMantenanceQuery } from "@/hooks/use-mantenance-query"
import { useTagQuery } from "@/hooks/use-tag-query"
import { MaintenanceStatus } from "@/types"
import { AlertTriangle, ArrowLeft, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

function TrackPageContent() {
  const { t } = useLanguage()
  const { records } = useMantenanceQuery()
  const { getEnabledTagIntervals } = useTagQuery()
  const [step, setStep] = useState(1)
  const [currentKm, setCurrentKm] = useState("")
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus[]>([])

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
    setStep(2)
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
          <h1 className="text-xl font-bold">{t("maintenanceCheck")}</h1>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("currentOdometerReading")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="manual-km"
                    type="number"
                    value={currentKm}
                    onChange={(e) => setCurrentKm(e.target.value)}
                    placeholder={t("currentKilometers")}
                  />
                  <Button onClick={() => analyzeMaintenanceStatus(Number.parseInt(currentKm))} disabled={!currentKm}>
                    {t("check")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("currentOdometerReading")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{Number.parseInt(currentKm).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{t("km")}</div>
                </div>
              </CardContent>
            </Card>

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

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                {t("checkAgain")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TrackPage() {
  return (
    <ProtectedRoute>
      <TrackPageContent />
    </ProtectedRoute>
  )
}
