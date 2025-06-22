"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useLanguage } from "@/contexts/language-context"
import { useTags } from "@/hooks/use-tags"
import { ArrowLeft, Bell, Cloud, Plus, Trash2, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { TagInterval } from "@/types"

function SettingsPageContent() {
  const { t } = useLanguage()
  const { tagIntervals, loading, error, addTag, updateTag, deleteTag } = useTags()
  const [notifications, setNotifications] = useState(true)
  const [newTagName, setNewTagName] = useState("")

  useEffect(() => {
    const savedNotifications = localStorage.getItem("notifications-enabled")
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications))
    }
  }, [])

  const updateTagInterval = async (index: number, field: keyof TagInterval, value: any) => {
    const tagInterval = tagIntervals[index]
    if (!tagInterval?.id) return

    try {
      await updateTag(tagInterval.id, { [field]: value })
      toast.success(t("tagUpdatedSuccessfully"))
    } catch (err) {
      toast.error(t("failedToUpdateTag"))
      console.error("Error updating tag:", err)
    }
  }

  const addNewTag = async () => {
    if (newTagName.trim() && !tagIntervals.find((t) => t.tag === newTagName.trim())) {
      try {
        const newTag: Omit<TagInterval, 'id' | 'createdAt' | 'updatedAt' | 'userId'> = {
          tag: newTagName.trim(),
          kilometers: 5000,
          days: 180,
          enabled: true,
        }
        await addTag(newTag)
        setNewTagName("")
        toast.success(t("tagAddedSuccessfully"))
      } catch (err) {
        toast.error(t("failedToAddTag"))
        console.error("Error adding tag:", err)
      }
    }
  }

  const removeTag = async (index: number) => {
    const tagInterval = tagIntervals[index]
    if (!tagInterval?.id) return

    if (confirm(t("confirmRemoveTag").replace("{tag}", tagInterval.tag))) {
      try {
        await deleteTag(tagInterval.id)
        toast.success(t("tagRemovedSuccessfully"))
      } catch (err) {
        toast.error(t("failedToRemoveTag"))
        console.error("Error removing tag:", err)
      }
    }
  }

  const toggleNotifications = (enabled: boolean) => {
    setNotifications(enabled)
    localStorage.setItem("notifications-enabled", JSON.stringify(enabled))
  }

  const clearAllData = () => {
    if (confirm(t("confirmClearData"))) {
      localStorage.removeItem("notifications-enabled")
      toast.success(t("dataClearedSuccess"))
    }
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
          <h1 className="text-xl font-bold">{t("settings")}</h1>
        </div>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t("notifications")}
            </CardTitle>
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
          </CardHeader>
          <CardContent>
            <LanguageSwitcher />
          </CardContent>
        </Card>

        {/* Maintenance Tags & Intervals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              {t("maintenanceTagsIntervals")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Tag */}
            <div className="flex gap-2">
              <Input
                placeholder={t("addNewMaintenanceTag")}
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNewTag()}
                disabled={loading}
              />
              <Button onClick={addNewTag} size="icon" variant="outline" disabled={loading}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">{t("loading")}</p>
              </div>
            )}

            {/* Existing Tags */}
            {!loading && tagIntervals.map((tagInterval, index) => (
              <div key={tagInterval.id || index} className="space-y-3 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{tagInterval.tag}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500"
                      onClick={() => removeTag(index)}
                      disabled={loading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <Switch
                    checked={tagInterval.enabled}
                    onCheckedChange={(enabled) => updateTagInterval(index, "enabled", enabled)}
                    disabled={loading}
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
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">{t("everyDays")}</Label>
                      <Input
                        type="number"
                        value={tagInterval.days || ""}
                        onChange={(e) => updateTagInterval(index, "days", Number.parseInt(e.target.value) || undefined)}
                        placeholder="e.g., 90"
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Empty state */}
            {!loading && tagIntervals.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>{t("noTagsYet")}</p>
                <p className="text-sm">{t("addYourFirstTag")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">{t("dataManagement")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={clearAllData} className="w-full flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              {t("clearAllData")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsPageContent />
    </ProtectedRoute>
  )
}

