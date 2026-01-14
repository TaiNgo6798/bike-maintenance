"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { useOdoCheckQuery } from "@/hooks/use-odo-check-query"
import { useLanguage } from "@/contexts/locale/language-context"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, AlertTriangle, Clock, CheckCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { OdoCheckResult } from "@/types"
import { useState } from "react"
import { clearAllOdoChecks } from "@/lib/firebase/firestore/odo-check"

function OdoChecksPageContent() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const { checks, loading, refetch } = useOdoCheckQuery()
  const [clearing, setClearing] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric"
    })
  }

  const getStatusIcon = (status: string) => {
      switch (status) {
        case "overdue":
          return <AlertTriangle className="h-4 w-4 text-red-500" />
        case "due-soon":
          return <Clock className="h-4 w-4 text-yellow-500" />
        default:
          return <CheckCircle className="h-4 w-4 text-green-500" />
      }
    }

  const getStatusText = (status: string) => {
    switch (status) {
      case "overdue":
        return t("overdue") || "Overdue"
      case "due-soon":
        return t("dueSoon") || "Due Soon"
      default:
        return t("ok") || "OK"
    }
  }

  const handleClearAll = async () => {
    if (!user) return

    setClearing(true)
    try {
      await clearAllOdoChecks(user.uid)
      await refetch()
    } catch (error) {
      console.error("Failed to clear odo check history:", error)
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">{t("checkHistory") || "Odometer Check History"}</h1>
          </div>

          {checks.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-1" />
                  {t("clearAll") || "Clear All"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("clearHistoryTitle") || "Clear All History?"}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("clearHistoryDescription") || "This will permanently delete all odometer check history. This action cannot be undone."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel") || "Cancel"}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAll}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={clearing}
                  >
                    {clearing ? (t("clearing") || "Clearing...") : (t("clearAll") || "Clear All")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {loading ? (
             <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">{t("loading") || "Loading..."}</p>
                </CardContent>
              </Card>
        ) : (
            <div className="space-y-4">
                {checks.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center text-gray-500">
                            {t("noHistory") || "No check history found."}
                        </CardContent>
                    </Card>
                ) : (
                    checks.map((check) => (
                        <Card key={check.id}>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex justify-between items-center text-base">
                                    <span className="text-blue-600 font-bold">{check.kilometers.toLocaleString()} km</span>
                                    <span className="text-sm font-normal text-gray-500">{formatDate(check.date)}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {(check.results || []).map((result: OdoCheckResult, index: number) => (
                                        <div key={index} className="flex items-center justify-between text-sm py-1 border-b last:border-0 border-gray-100">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(result.status)}
                                                <span>{result.tagName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                 {result.kmUntilDue !== undefined && (
                                                    <span className={`text-xs ${result.kmUntilDue < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                                        {result.kmUntilDue > 0 
                                                            ? `${result.kmUntilDue.toLocaleString()} ${t("kmLeft")}` 
                                                            : `${Math.abs(result.kmUntilDue).toLocaleString()} ${t("kmOverdue")}`}
                                                    </span>
                                                )}
                                                <Badge variant="outline" className="text-xs font-normal">
                                                    {getStatusText(result.status)}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                    {(!check.results || check.results.length === 0) && (
                                        <p className="text-xs text-muted-foreground italic">No detailed status details saved.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        )}
      </div>
    </div>
  )
}

export default function OdoChecksPage() {
  return (
    <ProtectedRoute>
      <OdoChecksPageContent />
    </ProtectedRoute>
  )
}
