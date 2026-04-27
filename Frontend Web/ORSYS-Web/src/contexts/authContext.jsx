import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "./AuthContextInstance";
import { subscribeToAuthChanges, logoutUser } from "../api/services/auth.service";
import { db } from "../api/firebaseConfig"; 
// Added collection, query, where, getDocs for the officer check
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          // 1. Fetch base profile
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            let finalRole = userData.userRole; // Get initial role (student/superAdmin)

            // 2. ORSYS Promotion Logic: If student, check for Officer status
            if (finalRole === "student") {
              const membershipsRef = collection(db, "memberships");
              const q = query(
                membershipsRef, 
                where("userId", "==", currentUser.uid), 
                where("membershipRole", "==", "officer")
              );
              
              const membershipSnap = await getDocs(q);
              
              if (!membershipSnap.empty) {
                finalRole = "admin"; // Promote to admin globally
                // Optionally attach the groupId if needed for organization-specific data
                const orgData = membershipSnap.docs[0].data();
                userData.orgId = orgData.groupId;
              }
            }

            // 3. Save the profile with the corrected role
            setProfile({ ...userData, userRole: finalRole });
          } else {
            console.warn("No Firestore profile found.");
            setProfile(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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