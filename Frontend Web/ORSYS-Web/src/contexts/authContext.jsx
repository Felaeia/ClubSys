import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "./AuthContextInstance";
import { subscribeToAuthChanges, logoutUser } from "../api/services/auth.service";
import { db } from "../api/firebaseConfig"; 
import { doc, getDoc } from "firebase/firestore";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // The Firestore data (LastName, Role, etc.)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Listen for Auth changes (Login/Logout)
    const unsubscribe = subscribeToAuthChanges(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          // 2. Fetch the Firestore document using the UID
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          
          if (userDoc.exists()) {
            // 3. Save the Firestore data (this includes profilePictureUrl!)
            setProfile(userDoc.data());
          } else {
            console.warn("No Firestore profile found for this user.");
            setProfile(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfile(null);
        }
      } else {
        // Clear everything on logout
        setUser(null);
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Include 'profile' in the value so Sidebar and Dashboards can use it
  const value = useMemo(() => ({
    user,
    profile, 
    logout: logoutUser,
    loading
  }), [user, profile, loading]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};