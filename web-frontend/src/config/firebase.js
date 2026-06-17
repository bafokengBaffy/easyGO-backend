import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA7HxJYxQ5R45WcRAmF_VPAZSurzQ52cCc",
  authDomain: "easygols.firebaseapp.com",
  projectId: "easygols",
  storageBucket: "easygols.appspot.com",
  messagingSenderId: "11467875224",
  appId: "1:11467875224:web:af00c43f10cfe7adc681ed"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};