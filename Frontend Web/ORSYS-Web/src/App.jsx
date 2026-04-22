import React, { useState, useEffect } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

function App() {
  const [user, setUser] = useState({
    firstName: "Loading...",
    middleName: "Loading//",
    lastName: "Loading..."
  });

  useEffect(() => {
    // 1. Define the function INSIDE the effect
    const fetchUserData = async () => {
      const docRef = doc(db, "users", "1IAXxMaQ4kPEgoHeLvu3ohCL5Pn1");
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          // This is now considered an "asynchronous callback" 
          // which is exactly what the linter wants.
          setUser(docSnap.data()); 
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    // 2. Call it immediately
    fetchUserData();

  }, []); // 3. Empty dependency array ensures it only runs once

  return (
    <div className="p-8 bg-slate-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold border-b border-blue-500 pb-2">
        Vantage System Terminal
      </h1>
      <div className="mt-4">
        <p className="text-gray-400">Current User:</p>
        <h2 className="text-4xl font-mono text-blue-400">
           {user.firstName} {user.middleName} {user.lastName} 
        </h2>
      </div>
    </div>
  );
}

export default App;