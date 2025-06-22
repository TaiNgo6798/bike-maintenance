# Bike Maintenance App
## Overview

A comprehensive bike maintenance tracking app built with Next.js, TypeScript, and Firebase. Track your bike maintenance records, upload photos, and get reminders for upcoming maintenance tasks.

## Features

- 🔐 **Google Authentication**: Simple and secure sign-in with Google accounts
- 📸 **Photo Capture**: Take photos of your odometer and maintenance work
- 📊 **Maintenance Tracking**: Record maintenance activities with tags and notes
- 🔍 **Search & Filter**: Search through your maintenance history
- 📱 **PWA Support**: Install as a progressive web app
- 🌐 **Multi-language**: Support for multiple languages
- ☁️ **Cloud Storage**: Firebase integration for data and image storage
- 🔔 **Maintenance Reminders**: Get notified about upcoming maintenance
- 👤 **User-Specific Data**: Each user's maintenance records are isolated

## Firebase Setup

This app uses Firebase for authentication, data storage, and image uploads. Follow these steps to set up Firebase:

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter your project name and follow the setup wizard

### 2. Enable Authentication

1. In your Firebase project, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" authentication
5. Configure your Google OAuth consent screen if needed

### 3. Enable Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Select a location for your database

### 4. Enable Storage

1. In your Firebase project, go to "Storage"
2. Click "Get started"
3. Choose "Start in test mode" for development
4. Select a location for your storage

### 5. Get Your Configuration

1. In your Firebase project, go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click the web app icon (</>) to add a web app
4. Register your app and copy the configuration

### 6. Set Environment Variables

1. Copy `env.example` to `.env.local`
2. Replace the placeholder values with your Firebase configuration:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 7. Security Rules

For production, update your Firestore and Storage security rules to require authentication:

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /maintenance-records/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /maintenance-images/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 8. Firestore Indexes (Optional but Recommended)

For optimal performance, create a composite index in Firestore:

1. Go to your Firebase Console → Firestore Database
2. Click on the "Indexes" tab
3. Click "Create Index"
4. Set up the following index:
   - **Collection ID**: `maintenance-records`
   - **Fields to index**:
     - `userId` (Ascending)
     - `date` (Descending)
   - **Query scope**: Collection

This index will improve query performance for user-specific maintenance records. The app includes fallback logic if the index isn't created, but performance will be better with the index.

## Development

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your Firebase configuration

# Run development server
pnpm dev
```

## Authentication Features

The app uses Google authentication for a simple and secure user experience:

- **Google Sign-In**: One-click authentication with Google accounts
- **Automatic Account Creation**: New users are automatically created on first sign-in
- **User Profile**: Display user information from Google profile
- **Protected Routes**: All maintenance features require authentication
- **User-Specific Data**: Each user only sees their own maintenance records
- **Secure Sign Out**: Easy sign out functionality

## Deployment

Your project is live at:

**[https://vercel.com/taingo6798s-projects/v0-oil-change-app-features](https://vercel.com/taingo6798s-projects/v0-oil-change-app-features)**

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Firebase Firestore, Firebase Storage, Firebase Authentication
- **PWA**: Next.js PWA plugin
- **State Management**: React hooks with custom Firebase hook
- **Notifications**: Sonner toast notifications
- **Authentication**: Firebase Auth with Google sign-in
