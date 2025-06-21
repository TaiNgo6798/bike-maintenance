"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Camera, ArrowLeft, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

interface MaintenanceRecord {
  id: string
  date: string
  kilometers: number
  tags: string[]
  photo?: string
  notes?: string
}

interface TagInterval {
  tag: string
  kilometers?: number
  days?: number
  enabled: boolean
}

interface MaintenanceStatus {
  tag: string
  lastMaintenance?: MaintenanceRecord
  kmSinceLastMaintenance: number
  daysSinceLastMaintenance: number
  kmUntilDue?: number
  daysUntilDue?: number
  status: "overdue" | "due-soon" | "ok"
  interval: TagInterval
}

const DEFAULT_TAG_INTERVALS: TagInterval[] = [
  { tag: "Oil Change", kilometers: 3000, days: 90, enabled: true },
  { tag: "Air Filter", kilometers: 6000, days: 180, enabled: true },
  { tag: "Spark Plug", kilometers: 8000, days: 365, enabled: true },
  { tag: "Chain Cleaning", kilometers: 1000, days: 30, enabled: true },
  { tag: "Brake Pads", kilometers: 15000, days: 730, enabled: true },
  { tag: "Tire Check", kilometers: 5000, days: 180, enabled: true },
  { tag: "Battery Check", kilometers: 10000, days: 365, enabled: true },
]

export default function TrackPage() {
  const [step, setStep] = useState(1)
  const [photo, setPhoto] = useState<string | null>(null)
  const [currentKm, setCurrentKm] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus[]>([])
  const [tagIntervals, setTagIntervals] = useState<TagInterval[]>(DEFAULT_TAG_INTERVALS)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load tag intervals from localStorage
    const savedIntervals = localStorage.getItem("tag-intervals")
    if (savedIntervals) {
      setTagIntervals(JSON.parse(savedIntervals))
    }
  }, [])

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhoto(e.target?.result as string)
        setIsProcessing(true)

        // Simulate OCR processing
        setTimeout(() => {
          // Simulate detected kilometers
          const detectedKm = Math.floor(Math.random() * 40000) + 15000
          setCurrentKm(detectedKm.toString())
          setIsProcessing(false)
          analyzeMaintenanceStatus(detectedKm)
        }, 2000)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeMaintenanceStatus = (currentKilometers: number) => {
    const records: MaintenanceRecord[] = JSON.parse(localStorage.getItem("maintenance-records") || "[]")
    const currentDate = new Date()

    const statusList: MaintenanceStatus[] = []

    tagIntervals.forEach((interval) => {
      if (!interval.enabled) return

      // Find the most recent maintenance for this tag
      const tagRecords = records
        .filter((record) => record.tags.includes(interval.tag))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      const lastMaintenance = tagRecords[0]

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
        tag: interval.tag,
        lastMaintenance,
        kmSinceLastMaintenance,
        daysSinceLastMaintenance,
        kmUntilDue,
        daysUntilDue,
        status,
        interval,
      })
    })

    // Sort by priority: overdue first, then due-soon, then ok
    statusList.sort((a, b) => {
      const priority = { overdue: 0, "due-soon": 1, ok: 2 }
      return priority[a.status] - priority[b.status]
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
          <h1 className="text-xl font-bold">Maintenance Check</h1>
        </div>

        {/* Step 1: Photo Capture */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Current Odometer Reading</CardTitle>
              <CardDescription>Take a photo of your current odometer to check maintenance status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                ref={fileInputRef}
                className="hidden"
              />

              {!photo ? (
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 flex flex-col gap-2 border-2 border-dashed"
                  variant="outline"
                >
                  <Camera className="h-8 w-8" />
                  Take Current Reading
                </Button>
              ) : (
                <div className="space-y-4">
                  <img
                    src={photo || "/placeholder.svg"}
                    alt="Current Odometer"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {isProcessing && (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Analyzing maintenance status...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Manual input option */}
              <div className="space-y-2">
                <Label htmlFor="manual-km">Or enter manually:</Label>
                <div className="flex gap-2">
                  <Input
                    id="manual-km"
                    type="number"
                    value={currentKm}
                    onChange={(e) => setCurrentKm(e.target.value)}
                    placeholder="Current kilometers"
                  />
                  <Button onClick={() => analyzeMaintenanceStatus(Number.parseInt(currentKm))} disabled={!currentKm}>
                    Check
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Maintenance Status */}
        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Reading</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{Number.parseInt(currentKm).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Kilometers</div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Maintenance Status</h2>

              {maintenanceStatus.map((status) => (
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
                        {status.status === "overdue" ? "Overdue" : status.status === "due-soon" ? "Due Soon" : "OK"}
                      </Badge>
                    </div>

                    {status.lastMaintenance ? (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-600">
                          Last: {status.lastMaintenance.kilometers.toLocaleString()} km (
                          {formatDate(status.lastMaintenance.date)})
                        </div>

                        {status.interval.kilometers && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Distance: {status.kmSinceLastMaintenance.toLocaleString()} km</span>
                              <span>{status.interval.kilometers.toLocaleString()} km interval</span>
                            </div>
                            <Progress value={getProgressValue(status)} className="h-2" />
                            {status.kmUntilDue !== undefined && (
                              <div className="text-xs text-gray-500">
                                {status.kmUntilDue > 0
                                  ? `${status.kmUntilDue.toLocaleString()} km remaining`
                                  : `${Math.abs(status.kmUntilDue).toLocaleString()} km overdue`}
                              </div>
                            )}
                          </div>
                        )}

                        {status.interval.days && (
                          <div className="text-sm text-gray-600">
                            Days: {status.daysSinceLastMaintenance} / {status.interval.days}
                            {status.daysUntilDue !== undefined && (
                              <span className="ml-2">
                                (
                                {status.daysUntilDue > 0
                                  ? `${status.daysUntilDue} days left`
                                  : `${Math.abs(status.daysUntilDue)} days overdue`}
                                )
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">No previous maintenance recorded</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Check Again
              </Button>
              <Link href="/add-maintenance" className="flex-1">
                <Button className="w-full">Add Maintenance</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
