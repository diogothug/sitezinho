import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app = null;
let db = null;
let functions = null;
let auth = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  // Mesma região configurada nas Cloud Functions (functions/index.js)
  functions = getFunctions(app, 'southamerica-east1');
  auth = getAuth(app);
} else {
  console.warn(
    'Firebase não configurado (faltam variáveis VITE_FIREBASE_*). ' +
    'A votação de músicas do café não vai funcionar até isso ser configurado — veja SETUP_YOUTUBE.md.'
  );
}

/**
 * Garante que o hóspede tem uma sessão anônima do Firebase Auth antes de
 * votar — é o que permite ao backend aplicar "um voto por pessoa por música".
 */
export function ensureAnonymousAuth() {
  return new Promise((resolve, reject) => {
    if (!auth) {
      reject(new Error('Firebase não configurado.'));
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        signInAnonymously(auth).then(cred => resolve(cred.user)).catch(reject);
      }
    });
  });
}

export function callSearchYoutubeSongs(query) {
  if (!functions) return Promise.reject(new Error('Firebase não configurado.'));
  const fn = httpsCallable(functions, 'searchYoutubeSongs');
  return fn({ query });
}

export function callVoteSong(song) {
  if (!functions) return Promise.reject(new Error('Firebase não configurado.'));
  const fn = httpsCallable(functions, 'voteSong');
  return fn(song);
}

export { app, db, functions, auth, isFirebaseConfigured };
