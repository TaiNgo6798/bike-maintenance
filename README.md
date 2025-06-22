# Bike Maintenance App
## Overview

A comprehensive bike maintenance tracking app built with Next.js, TypeScript, and Firebase. Track your bike maintenance records, upload photos, and get reminders for upcoming maintenance tasks.

## Features

- 🔐 **Google Authentication**: Simple and secure sign-in with Google accounts
- 📸 **Photo Capture**: Take photos of your odometer and maintenance work
- 📊 **Maintenance Tracking**: Record maintenance activities with tags and notes
- 🏷️ **Cloud Tag Management**: Store and sync maintenance tags across devices
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
    match /tag-intervals/{document} {
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

For optimal performance, create composite indexes in Firestore:

1. Go to your Firebase Console → Firestore Database
2. Click on the "Indexes" tab
3. Click "Create Index"
4. Set up the following indexes:

**Maintenance Records Index:**
- **Collection ID**: `maintenance-records`
- **Fields to index**:
  - `userId` (Ascending)
  - `date` (Descending)
- **Query scope**: Collection

**Tag Intervals Index:**
- **Collection ID**: `tag-intervals`
- **Fields to index**:
  - `userId` (Ascending)
  - `tag` (Ascending)
- **Query scope**: Collection

These indexes will improve query performance for user-specific data. The app includes fallback logic if the indexes aren't created, but performance will be better with the indexes.

## Tag Management

The app supports cloud-based tag management with the following features:

### Cloud Storage
- Tags are stored in Firebase Firestore
- Automatic sync across devices
- User-specific tag isolation

### Tag Features
- Create custom maintenance tags
- Set kilometer and time intervals
- Enable/disable tags for maintenance reminders
- Tag suggestions in maintenance forms

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

## Data Structure

### Maintenance Records
```typescript
interface MaintenanceRecord {
  id?: string
  userId: string
  date: string
  kilometers: number
  tags: string[]
  photo?: string
  notes?: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}
```

### Tag Intervals
```typescript
interface TagInterval {
  id?: string
  userId: string
  tag: string
  kilometers?: number
  days?: number
  enabled: boolean
  createdAt?: Timestamp
  updatedAt?: Timestamp
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
