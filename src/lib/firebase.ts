import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, signInAnonymously, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
}

export const isFirebaseConfigured = Boolean(
  config.apiKey &&
    config.projectId &&
    config.appId &&
    !config.apiKey.includes('your_') &&
    config.apiKey.length > 10,
)

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

export function getFirebase() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase není nastavené. Vyplň .env podle README.')
  }
  if (!app) {
    app = initializeApp(config)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
  }
  return { app, auth: auth!, db: db!, storage: storage! }
}

export async function ensureAnonAuth() {
  const { auth } = getFirebase()
  if (!auth.currentUser) {
    await signInAnonymously(auth)
  }
  return auth.currentUser!
}
