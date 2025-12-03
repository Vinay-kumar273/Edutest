# Firestore Rules Deployment Guide

## Important: Deploy Firestore Rules

The `firestore.rules` file in this project contains the security rules for your Firestore database. These rules **must be deployed** to your Firebase project for the app to work correctly.

## How to Deploy Firestore Rules

### Option 1: Using Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **edutest-pro-84730**
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab at the top
5. Copy the entire content from `firestore.rules` file in this project
6. Paste it into the Firebase Console rules editor
7. Click **Publish** button

### Option 2: Using Firebase CLI

If you have Firebase CLI installed:

```bash
firebase deploy --only firestore:rules
```

## Current Rules Summary

The current rules allow:

### Batches & Test Series
- **Read**: All authenticated users
- **Write**: Admin only

### Test Attempts
- **Read**: All authenticated users
- **Create**: All authenticated users
- **Update/Delete**: Admin only

### Enrollments
- **Read**: All authenticated users
- **Create**: All authenticated users
- **Delete**: All authenticated users
- **Update**: Admin only

### User Progress
- **Read**: All authenticated users
- **Create/Update**: All authenticated users
- **Delete**: Admin only

## Troubleshooting

If you see errors like "Missing or insufficient permissions":

1. Make sure you've deployed the rules to Firebase Console
2. Wait 1-2 minutes after deployment for rules to propagate
3. Refresh your application
4. Check that the user is properly authenticated (logged in)

## Admin Email

The current admin email is: **archanakumariak117@gmail.com**

Only this email address has admin privileges to create batches, test series, and manage all data.
