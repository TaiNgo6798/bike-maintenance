"use client"

import React from "react"
import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Camera, ArrowLeft, Check, Plus, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import { useFirebase } from "@/hooks/use-firebase"
import { useTags } from "@/hooks/use-tags"
import { toast } from "sonner"
import { ProtectedRoute } from "@/components/auth/protected-route"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type MaintenanceFormData = {
  kilometers: string
  tags: string[]
  notes?: string
}

type NewTagFormData = {
  tagName: string
  kilometers?: string
  days?: string
}

function AddMaintenancePageContent() {
  const { t } = useLanguage()
  const { addRecord, loading, error } = useFirebase()
  const { userTags, addTag, loading: tagsLoading } = useTags()
  const [step, setStep] = useState(1)
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showNewTagModal, setShowNewTagModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Zod schema for form validation
  const maintenanceFormSchema = z.object({
    kilometers: z.string()
      .min(1, t("kilometersRequired"))
      .regex(/^\d+$/, t("kilometersMustBeNumber")),
    tags: z.array(z.string()).min(1, t("atLeastOneTagRequired")),
    notes: z.string().optional(),
  })

  // Zod schema for new tag modal
  const newTagSchema = z.object({
    tagName: z.string().min(1, t("tagNameRequired")),
    kilometers: z.string().optional(),
    days: z.string().optional(),
  }).refine((data) => {
    // At least one interval must be specified
    return data.kilometers || data.days
  }, {
    message: t("atLeastOneIntervalRequired"),
    path: ["kilometers"]
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      kilometers: "",
      tags: [],
      notes: "",
    },
  })

  const {
    register: registerNewTag,
    handleSubmit: handleSubmitNewTag,
    reset: resetNewTag,
    formState: { errors: newTagErrors },
  } = useForm<NewTagFormData>({
    resolver: zodResolver(newTagSchema),
    defaultValues: {
      tagName: "",
      kilometers: "",
      days: "",
    },
  })

  const selectedTags = watch("tags")

  const handlePhotoCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhoto(e.target?.result as string)
        setIsProcessing(true)
      }
      reader.readAsDataURL(file)

      // Call the ODO detection API
      try {
        const formData = new FormData()
        formData.append('image', file)

        const response = await fetch('/api/odo-detect', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const err = await response.json();
          toast.error(err.error);
        }

        const { odo } = await response.json()
        
        // Set the detected kilometers
        setValue("kilometers", odo)
      } catch (error) {
        console.error('Error detecting ODO:', error)
        toast.error(t("failedToDetectODO"))
      } finally {
        setIsProcessing(false)
        setStep(2)
      }
    }
  }

  const toggleTag = (tag: string) => {
    const currentTags = selectedTags || []
    const newTags = currentTags.includes(tag) 
      ? currentTags.filter((t) => t !== tag) 
      : [...currentTags, tag]
    setValue("tags", newTags)
  }

  const removeTag = (tag: string) => {
    const currentTags = selectedTags || []
    setValue("tags", currentTags.filter((t) => t !== tag))
  }

  const handleNewTagSubmit = async (data: NewTagFormData) => {
    try {
      const newTag = {
        tag: data.tagName.trim(),
        kilometers: data.kilometers ? Number.parseInt(data.kilometers) : undefined,
        days: data.days ? Number.parseInt(data.days) : undefined,
        enabled: true,
      }

      // Add to Firebase
      await addTag(newTag)

      // Add to selected tags
      const currentTags = selectedTags || []
      setValue("tags", [...currentTags, newTag.tag])

      // Close modal and reset form
      setShowNewTagModal(false)
      resetNewTag()
      toast.success(`${t("tagAddedSuccessfully")}: ${newTag.tag}`)
    } catch (err) {
      toast.error(t("failedToAddTag"))
      console.error("Error adding tag:", err)
    }
  }

  const onSubmit = async (data: MaintenanceFormData) => {
    try {
      const newRecord = {
        date: new Date().toISOString(),
        kilometers: Number.parseInt(data.kilometers),
        tags: data.tags,
        notes: data.notes?.trim() || undefined,
      }

      await addRecord(newRecord, photoFile || undefined)
      toast.success(t("maintenanceRecordSaved"))
      router.push("/")
    } catch (err) {
      toast.error(t("failedToSaveRecord"))
      console.error("Error saving record:", err)
    }
  }

  // Show error toast if there's an error
  React.useEffect(() => {
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
          <h1 className="text-xl font-bold">{t("addMaintenance")}</h1>
        </div>

        {/* Step 1: Photo Capture */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>{t("takeOdometerPhoto")}</CardTitle>
              <CardDescription>{t("takePhotoDescription")}</CardDescription>
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
                  {t("tapToTakePhoto")}
                </Button>
              ) : (
                <div className="space-y-4">
                  <img
                    src={photo || "/placeholder.svg"}
                    alt="Odometer"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {isProcessing && (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">{t("detectingKilometers")}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Confirm Kilometers & Add Tags */}
        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("confirmReading")}</CardTitle>
                <CardDescription>{t("verifyReading")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="kilometers">{t("kilometers")}</Label>
                  <Input
                    id="kilometers"
                    type="number"
                    {...register("kilometers")}
                    placeholder={t("enterKilometers")}
                    className={errors.kilometers ? "border-red-500" : ""}
                  />
                  {errors.kilometers && (
                    <p className="text-sm text-red-500">{errors.kilometers.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("selectMaintenanceTags")}</CardTitle>
                <CardDescription>{t("chooseMaintenancePerformed")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Available Tags from Firebase */}
                <div className="flex flex-wrap gap-2">
                  {userTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags?.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Add New Tag with Intervals Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewTagModal(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("addNewTagWithIntervals")}
                </Button>

                {/* Selected Tags */}
                {selectedTags && selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="default" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:bg-red-500 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                {errors.tags && (
                  <p className="text-sm text-red-500">{errors.tags.message}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("additionalNotes")}</CardTitle>
                <CardDescription>{t("optionalNotesDescription")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder={t("enterNotes")}
                  {...register("notes")}
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t("saving")}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {t("saveRecord")}
                </div>
              )}
            </Button>
          </form>
        )}

        {/* New Tag Modal */}
        <Dialog open={showNewTagModal} onOpenChange={setShowNewTagModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("addNewTagWithIntervals")}</DialogTitle>
              <DialogDescription>
                {t("addNewTagWithIntervalsDescription")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitNewTag(handleNewTagSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tagName">{t("tagName")}</Label>
                <Input
                  id="tagName"
                  {...registerNewTag("tagName")}
                  placeholder={t("enterTagName")}
                  className={newTagErrors.tagName ? "border-red-500" : ""}
                />
                {newTagErrors.tagName && (
                  <p className="text-sm text-red-500">{newTagErrors.tagName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kilometers">{t("everyKm")}</Label>
                  <Input
                    id="kilometers"
                    type="number"
                    {...registerNewTag("kilometers")}
                    placeholder="e.g., 3000"
                    className={newTagErrors.kilometers ? "border-red-500" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="days">{t("everyDays")}</Label>
                  <Input
                    id="days"
                    type="number"
                    {...registerNewTag("days")}
                    placeholder="e.g., 90"
                    className={newTagErrors.days ? "border-red-500" : ""}
                  />
                </div>
              </div>

              {(newTagErrors.kilometers || newTagErrors.days) && (
                <p className="text-sm text-red-500">
                  {newTagErrors.kilometers?.message || newTagErrors.days?.message}
                </p>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowNewTagModal(false)
                    resetNewTag()
                  }}
                >
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={tagsLoading}>
                  {t("addTag")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default function AddMaintenancePage() {
  return (
    <ProtectedRoute>
      <AddMaintenancePageContent />
    </ProtectedRoute>
  )
}
