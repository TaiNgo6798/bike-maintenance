"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useLanguage } from "@/contexts/locale/language-context"
import { useTagQuery } from "@/hooks/use-tag-query"
import { APP_VERSION } from "@/lib/version"
import { ArrowLeft, Cloud, Info, Plus, Save, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { twMerge } from "tailwind-merge"

const settingsSchema = z.object({
  tagIntervals: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    kilometers: z.number().min(1).optional(),
    days: z.number().or(z.nan()).optional(),
    enabled: z.boolean(),
  })),
})

type SettingsFormData = z.infer<typeof settingsSchema>

function SettingsPageContent() {
  const { t } = useLanguage()
  const { tagIntervals: tagIntervalData, loading, error, addTag, updateTag, deleteTag } = useTagQuery()

  const [newTagName, setNewTagName] = useState("")

  // Settings form
  const settingsForm = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      tagIntervals: [],
    },
  })
  

  const { fields: tagIntervals, remove, update, prepend } = useFieldArray({
    control: settingsForm.control,
    name: "tagIntervals",
    keyName: "formId",
  })


  useEffect(() => {
    if (tagIntervalData) {
      settingsForm.setValue("tagIntervals", tagIntervalData)
    }
  }, [tagIntervalData, settingsForm])


  const saveSettings = async (data: SettingsFormData) => {
    try {
      const currentTagIntervals = data['tagIntervals']
      
      // Find tags that were removed (exist in tagIntervalData but not in current form)
      const removedTags = tagIntervalData.filter(existingTag => 
        !currentTagIntervals.some(formTag => formTag.id === existingTag.id)
      )
      
      // Prepare all database operations
      const deletePromises = removedTags
        .filter(tag => tag.id)
        .map(tag => () => deleteTag(tag.id!))
      
      const toAddTags = currentTagIntervals
        .filter(formTag => !formTag.id)

      const addPromises = toAddTags
        .map(formTag => () => addTag({
          name: formTag.name,
          kilometers: formTag.kilometers,
          days: formTag.days,
          enabled: formTag.enabled,
        }))
      
      const toUpdateTags = currentTagIntervals
        .filter(formTag => {
          const id = formTag.id
          if(toAddTags.find(tag => tag.id === id)) return false
          if(removedTags.find(tag => tag.id === id)) return false

          const previous = tagIntervalData.find(tag => tag.id === id)
          const current = formTag

          return previous?.name !== current.name || previous?.kilometers !== current.kilometers || previous?.days !== current.days || previous?.enabled !== current.enabled
        })

      const updatePromises = toUpdateTags
        .map(formTag => () => updateTag(formTag.id!, {
          name: formTag.name,
          kilometers: formTag.kilometers,
          days: formTag.days,
          enabled: formTag.enabled,
        }))
      

      // Execute all operations in parallel
      await Promise.all([
        ...deletePromises.map(p => p()),
        ...addPromises.map(p => p()),
        ...updatePromises.map(p => p()),
      ])
      
      toast.success(t("settingsSavedSuccessfully") || "Settings saved successfully")
    } catch (err) {
      toast.error(t("failedToSaveSettings") || "Failed to save settings")
      console.error("Error saving settings:", err)
    }
  }

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const addNewTag = () => {
    if(newTagName.trim() === "") {
      toast.error(t("tagMustHaveName") || "Tag must have a name")
      return
    }
    
    prepend({
      name: newTagName.trim(),
      kilometers: 5000,
      enabled: true,
    })

    setNewTagName("")
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

        <form onSubmit={settingsForm.handleSubmit(saveSettings)}>
          {/* Notifications */}
          {/* <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t("notifications")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">{t("enableNotifications")}</Label>
                <Switch id="notifications" checked={settingsForm.getValues("notifications")} onCheckedChange={toggleNotifications} />
              </div>
            </CardContent>
          </Card> */}

          {/* Language */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("language")}</CardTitle>
            </CardHeader>
            <CardContent>
              <LanguageSwitcher />
            </CardContent>
          </Card>

          {/* Maintenance Tags & Intervals */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                {t("maintenanceTagsIntervals")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Tag */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder={t("addNewMaintenanceTag")}
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button 
                  type="button"
                  onClick={addNewTag} 
                  size="icon" 
                  variant="outline" 
                  disabled={loading}
                >
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
                <div key={tagInterval.formId} className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{tagInterval.name}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500"
                        onClick={() => remove(index)}
                        disabled={loading}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <Switch
                      checked={tagInterval.enabled}
                      onCheckedChange={(enabled) => {
                        update(index, {
                          ...tagInterval,
                          enabled: enabled,
                        })
                      }}
                      disabled={loading}
                    />
                  </div>

                  {tagInterval.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">{t("everyKm")}</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 3000"
                          disabled={loading}
                          {...settingsForm.register(`tagIntervals.${index}.kilometers`, { valueAsNumber: true })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">{t("everyDays")}</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 90"
                          disabled={loading}
                          {...settingsForm.register(`tagIntervals.${index}.days`, { valueAsNumber: true })}
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

          {/* Save Settings Button */}
          <Button
            type="submit" 
            className={
              twMerge(
                "w-full flex items-center gap-2",
                loading || !settingsForm.formState.isDirty ? "hidden" : ""
              )
            }
          >
            <Save className="h-4 w-4" />
            {t("save")}
          </Button>
        </form>

        {/* About / App Version */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {t("about")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-gray-600">
              {t("appAbout")}
            </div>
            <div className="text-xs text-gray-500 pt-2 border-t">
              {t("appName")} v{APP_VERSION}
            </div>
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

