// Firebase configuration is handled via environment variables.
// See .env file for the template.
// The actual Firebase initialization is in services/firebase.ts
//
// To set up:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (or use existing)
// 3. Add a web app to get your config
// 4. Copy values into .env file
// 5. Enable Authentication (Email/Password + Google)
// 6. Create Firestore Database
// 7. Enable Storage

export const FIREBASE_SETUP_INSTRUCTIONS = `
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Auth → Email/Password and Google sign-in
3. Create a Firestore database in production mode
4. Enable Storage
5. Copy your config values to .env file
`;
