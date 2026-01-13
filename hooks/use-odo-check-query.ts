
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getOdoCheckHistory } from "@/lib/firebase/firestore/odo-check"
import { OdoCheckRecord } from "@/types"

export function useOdoCheckQuery() {
  const { user } = useAuth()
  const [checks, setChecks] = useState<OdoCheckRecord[]>([])
  const [latestCheck, setLatestCheck] = useState<OdoCheckRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChecks = useCallback(async () => {
    if (!user) {
      setChecks([])
      setLatestCheck(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
        // Parallelize fetching if needed, but for now strict calling is fine
      const history = await getOdoCheckHistory(user.uid)
      setChecks(history)
      
      // We can just rely on the history sorted being at 0, but this is explicit
      if (history.length > 0) {
          setLatestCheck(history[0])
      } else {
          setLatestCheck(null)
      }
      
    } catch (err) {
      console.error("Error fetching odo checks:", err)
      setError("Failed to fetch odometer checks")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchChecks()
  }, [fetchChecks])

  return { checks, latestCheck, loading, error, refetch: fetchChecks }
}
