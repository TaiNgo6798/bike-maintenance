"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/contexts/language-context"
import { useFirebase } from "@/hooks/use-firebase"
import { useTags } from "@/hooks/use-tags"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, ArrowRight, Camera, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

type MaintenanceFormData = {
  kilometers: string
  tagIDs: string[]
  notes?: string
}

function AddMaintenancePageContent() {
  const { t } = useLanguage()
  const { addRecord, loading, error } = useFirebase()
  const { userTags, loading: tagsLoading } = useTags()
  const [step, setStep] = useState(1)
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Zod schema for form validation
  const maintenanceFormSchema = z.object({
    kilometers: z.string()
      .min(1, t("kilometersRequired"))
      .regex(/^\d+$/, t("kilometersMustBeNumber")),
    tagIDs: z.array(z.string()).min(1, t("atLeastOneTagRequired")),
    notes: z.string().optional(),
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
      tagIDs: [],
      notes: "",
    },
  })

  const selectedTags = watch("tagIDs")

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
    setValue("tagIDs", newTags)
  }

  const onSubmit = async (data: MaintenanceFormData) => {
    try {
      const newRecord = {
        date: new Date().toISOString(),
        kilometers: Number.parseInt(data.kilometers),
        tagIDs: data.tagIDs,
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

              {/* Manual input option */}
              <div className="flex">
                  <Button 
                    onClick={() => setStep(2)} 
                    className="ml-auto"
                  >
                    {t("orEnterManually")} <ArrowRight className="h-4 w-4" />
                  </Button>
              </div>
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
                {tagsLoading && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                )}
                {!tagsLoading && (
                <div className="flex flex-wrap gap-2">
                  {userTags.map((tag) => (
                    <Badge
                      key={tag.id!}
                      variant={selectedTags?.includes(tag.id!) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag.id!)}
                    >
                      {tag.name}
                    </Badge>
                    ))}
                  </div>
                )}

                {errors.tagIDs && (
                  <p className="text-sm text-red-500">{errors.tagIDs.message}</p>
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
              disabled={loading || tagsLoading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t("saving")}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  {t("save")}
                </div>
              )}
            </Button>
          </form>
        )}
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
