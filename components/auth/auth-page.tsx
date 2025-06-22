'use client'

import { GoogleSignIn } from './google-signin'

export const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <GoogleSignIn />
      </div>
    </div>
  )
} 