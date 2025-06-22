import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const cleanUndefinedValues = <T extends Record<string, any>>(obj: T): T => {
  const cleaned = { ...obj }
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === undefined) {
      delete cleaned[key]
    }
  })
  return cleaned
}