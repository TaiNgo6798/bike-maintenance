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

interface TagInterval {
  tag: string
  kilometers?: number
  days?: number
  enabled: boolean
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

export default function SettingsPage() {
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
    if (confirm(`Remove "${tagIntervals[index].tag}" tag and its interval?`)) {
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
    if (confirm("Are you sure you want to clear all maintenance records? This cannot be undone.")) {
      localStorage.removeItem("maintenance-records")
      localStorage.removeItem("tag-intervals")
      localStorage.removeItem("notifications-enabled")
      alert("All data cleared successfully!")
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
          <h1 className="text-xl font-bold">Settings</h1>
        </div>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Get notified when maintenance is due</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Enable notifications</Label>
              <Switch id="notifications" checked={notifications} onCheckedChange={toggleNotifications} />
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Tags & Intervals */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Tags & Intervals</CardTitle>
            <CardDescription>Configure maintenance tags and their reminder intervals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Tag */}
            <div className="flex gap-2">
              <Input
                placeholder="Add new maintenance tag"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addNewTag()}
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
                      <Label className="text-sm">Every (km)</Label>
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
                      <Label className="text-sm">Every (days)</Label>
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
            <CardTitle className="text-red-600">Data Management</CardTitle>
            <CardDescription>Manage your maintenance data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={clearAllData} className="w-full flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>Bike Maintenance Tracker v1.0</p>
            <p>Keep track of your motorcycle maintenance with photo records and automatic reminders.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
