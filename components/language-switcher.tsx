"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{t("language")}:</span>
      <div className="flex rounded-md border">
        <Button
          variant={language === "en" ? "default" : "ghost"}
          size="sm"
          onClick={() => setLanguage("en")}
          className="rounded-r-none"
        >
          EN
        </Button>
        <Button
          variant={language === "vi" ? "default" : "ghost"}
          size="sm"
          onClick={() => setLanguage("vi")}
          className="rounded-l-none"
        >
          VI
        </Button>
      </div>
    </div>
  )
}
