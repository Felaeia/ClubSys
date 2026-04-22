import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "./AuthContextInstance"; // Import it here
import { subscribeToAuthChanges, logoutUser } from "../api/services/auth.service";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const value = useMemo(() => ({
    user,
    logout: logoutUser
  }), [user]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};