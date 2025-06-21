"use client"

import type React from "react"

import { useState, useRef } from "react"
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

export default function AddMaintenancePage() {
  const { t } = useLanguage()
  const [step, setStep] = useState(1)
  const [photo, setPhoto] = useState<string | null>(null)
  const [kilometers, setKilometers] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState("")
  const [notes, setNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const PREDEFINED_TAGS = [
    t("oilChange"),
    t("airFilter"),
    t("sparkPlug"),
    t("chainCleaning"),
    t("brakePads"),
    t("tireCheck"),
    t("batteryCheck"),
  ]

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhoto(e.target?.result as string)
        setIsProcessing(true)

        // Simulate OCR processing
        setTimeout(() => {
          // Simulate detected kilometers (random between 10000-50000)
          const detectedKm = Math.floor(Math.random() * 40000) + 10000
          setKilometers(detectedKm.toString())
          setIsProcessing(false)
          setStep(2)
        }, 2000)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags((prev) => [...prev, customTag.trim()])
      setCustomTag("")
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleSave = () => {
    const newRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      kilometers: Number.parseInt(kilometers),
      tags: selectedTags,
      photo,
      notes,
    }

    // Save to localStorage
    const existingRecords = JSON.parse(localStorage.getItem("maintenance-records") || "[]")
    const updatedRecords = [...existingRecords, newRecord]
    localStorage.setItem("maintenance-records", JSON.stringify(updatedRecords))

    router.push("/")
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
          <div className="space-y-6">
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
                    value={kilometers}
                    onChange={(e) => setKilometers(e.target.value)}
                    placeholder={t("enterKilometers")}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("selectMaintenanceTags")}</CardTitle>
                <CardDescription>{t("chooseMaintenancePerformed")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Predefined Tags */}
                <div className="flex flex-wrap gap-2">
                  {PREDEFINED_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Custom Tag Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder={t("addCustomTag")}
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addCustomTag()}
                  />
                  <Button onClick={addCustomTag} size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                  <div className="space-y-2">
                    <Label>{t("selectedTags")}:</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag) => (
                        <Badge key={tag} className="flex items-center gap-1">
                          {tag}
                          <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("notesOptional")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder={t("addAdditionalNotes")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                {t("back")}
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 flex items-center gap-2"
                disabled={!kilometers || selectedTags.length === 0}
              >
                <Check className="h-4 w-4" />
                {t("saveRecord")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
