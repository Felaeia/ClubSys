import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

/**
 * Log in and determine the specific Orsys role
 */
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const uid = userCredential.user.uid;

  // 1. Get the base user profile
  const userDoc = await getDoc(doc(db, "users", uid));
  if (!userDoc.exists()) throw new Error("User profile not found.");

  const userData = userDoc.data();
  let finalRole = userData.userRole; // 'superAdmin' or 'student'

  // 2. Logic: If student, check if they are an Officer in any group
  if (finalRole === "student") {
    const membershipsRef = collection(db, "memberships");
    const q = query(
      membershipsRef, 
      where("userId", "==", uid), 
      where("membershipRole", "==", "officer")
    );
    
    const membershipSnap = await getDocs(q);
    
    // If a document exists here, they are upgraded to Admin status
    if (!membershipSnap.empty) {
      finalRole = "admin"; 
      // You can also grab the specific groupId they manage here
      const orgData = membershipSnap.docs[0].data();
      return { user: userCredential.user, profile: userData, role: finalRole, orgId: orgData.groupId };
    }
  }

  return { user: userCredential.user, profile: userData, role: finalRole };
};

/**
 * Register a new user
 */
export const registerUser = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * Log the user out
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

/**
 * Observe auth state changes
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};