import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
// NOTE: In production, these should be in environment variables
const firebaseConfig = {
    apiKey: "AIzaSyBhLpFmN5kYpQ_your_api_key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-messaging-id",
    appId: "your-app-id"
};

// For development/demo purposes - using mock values
// Replace with your actual Firebase config
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
