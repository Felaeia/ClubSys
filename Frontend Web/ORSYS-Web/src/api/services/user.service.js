import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export const getUserRole = async (uid) => {
  const docRef = doc(db, "users", uid); 
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data().userRole; 
  }
  return null;
};