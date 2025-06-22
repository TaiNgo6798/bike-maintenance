"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Bell, Trash2, Plus, X } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

interface TagInterval {
  tag: string
  kilometers?: number
  days?: number
  enabled: boolean
}

export default function SettingsPage() {
  const { t } = useLanguage()

  const DEFAULT_TAG_INTERVALS: TagInterval[] = [
    { tag: t("oilChange"), kilometers: 3000, days: 90, enabled: true },
    { tag: t("airFilter"), kilometers: 6000, days: 180, enabled: true },
  ]

  const [tagIntervals, setTagIntervals] = useState<TagInterval[]>(DEFAULT_TAG_INTERVALS)
  const [notifications, setNotifications] = useState(true)
  const [newTagName, setNewTagName] = useState("")

  useEffect(() => {
    const savedIntervals = localStorage.getItem("tag-intervals")
    if (savedIntervals) {
      setTagIntervals(JSON.parse(savedIntervals))
    }

    const savedNotifications = localStorage.getItem("notifications-enabled")
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications))
    }
  }, [])

  const updateTagInterval = (index: number, field: keyof TagInterval, value: any) => {
    const updated = [...tagIntervals]
    updated[index] = { ...updated[index], [field]: value }
    setTagIntervals(updated)
    localStorage.setItem("tag-intervals", JSON.stringify(updated))
  }

  const addNewTag = () => {
    if (newTagName.trim() && !tagIntervals.find((t) => t.tag === newTagName.trim())) {
      const newTag: TagInterval = {
        tag: newTagName.trim(),
        kilometers: 5000,
        days: 180,
        enabled: true,
      }
      const updated = [...tagIntervals, newTag]
      setTagIntervals(updated)
      localStorage.setItem("tag-intervals", JSON.stringify(updated))
      setNewTagName("")
    }
  }

  const removeTag = (index: number) => {
    if (confirm(t("confirmRemoveTag").replace("{tag}", tagIntervals[index].tag))) {
      const updated = tagIntervals.filter((_, i) => i !== index)
      setTagIntervals(updated)
      localStorage.setItem("tag-intervals", JSON.stringify(updated))
    }
  }

  const toggleNotifications = (enabled: boolean) => {
    setNotifications(enabled)
    localStorage.setItem("notifications-enabled", JSON.stringify(enabled))
  }

  const clearAllData = () => {
    if (confirm(t("confirmClearData"))) {
      localStorage.removeItem("maintenance-records")
      localStorage.removeItem("tag-intervals")
      localStorage.removeItem("notifications-enabled")
      alert(t("dataClearedSuccess"))
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
          <h1 className="text-xl font-bold">{t("settings")}</h1>
        </div>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t("notifications")}
            </CardTitle>
            <CardDescription>{t("getNotified")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">{t("enableNotifications")}</Label>
              <Switch id="notifications" checked={notifications} onCheckedChange={toggleNotifications} />
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle>{t("language")}</CardTitle>
            <CardDescription>{t("chooseLanguage")}</CardDescription>
          </CardHeader>
          <CardContent>
            <LanguageSwitcher />
          </CardContent>
        </Card>

        {/* Maintenance Tags & Intervals */}
        <Card>
          <CardHeader>
            <CardTitle>{t("maintenanceTagsIntervals")}</CardTitle>
            <CardDescription>{t("configureMaintenanceTags")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Tag */}
            <div className="flex gap-2">
              <Input
                placeholder={t("addNewMaintenanceTag")}
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNewTag()}
              />
              <Button onClick={addNewTag} size="icon" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Existing Tags */}
            {tagIntervals.map((tagInterval, index) => (
              <div key={tagInterval.tag} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{tagInterval.tag}</Badge>
                    {index >= DEFAULT_TAG_INTERVALS.length && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500"
                        onClick={() => removeTag(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <Switch
                    checked={tagInterval.enabled}
                    onCheckedChange={(enabled) => updateTagInterval(index, "enabled", enabled)}
                  />
                </div>

                {tagInterval.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">{t("everyKm")}</Label>
                      <Input
                        type="number"
                        value={tagInterval.kilometers || ""}
                        onChange={(e) =>
                          updateTagInterval(index, "kilometers", Number.parseInt(e.target.value) || undefined)
                        }
                        placeholder="e.g., 3000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">{t("everyDays")}</Label>
                      <Input
                        type="number"
                        value={tagInterval.days || ""}
                        onChange={(e) => updateTagInterval(index, "days", Number.parseInt(e.target.value) || undefined)}
                        placeholder="e.g., 90"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">{t("dataManagement")}</CardTitle>
            <CardDescription>{t("manageMaintenanceData")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={clearAllData} className="w-full flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              {t("clearAllData")}
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t("about")}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>Bike Maintenance Tracker v1.0</p>
            <p>{t("keepTrackMotorcycle")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
