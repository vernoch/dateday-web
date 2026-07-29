import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, signInAnonymously, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

// Public web config — safe to ship in the client bundle for GitHub Pages builds.
const firebaseDefaults = {
  apiKey: 'AIzaSyBjDJiDfyf1vuf80mHVMyAvVXoSOkOczGE',
  authDomain: 'dateday-f8549.firebaseapp.com',
  projectId: 'dateday-f8549',
  storageBucket: 'dateday-f8549.firebasestorage.app',
  messagingSenderId: '981944035129',
  appId: '1:981944035129:web:31a5b805f02e7c4c71eae8',
}

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseDefaults.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseDefaults.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseDefaults.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseDefaults.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseDefaults.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseDefaults.appId,
}

export const APP_VERSION = '1.2.2'

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
