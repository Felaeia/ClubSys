import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

function TestFirebase() {
  const [status, setStatus] = useState("Connecting...");

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Try to fetch a collection (even if it's empty)
        const querySnapshot = await getDocs(collection(db, "test"));
        setStatus("Firebase Connected! ✅");
        console.log("Connection successful, items found:", querySnapshot.size);
      } catch (error) {
        console.error("Connection error:", error);
        setStatus("Connection Failed. ❌ Check console.");
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px' }}>
      <h3>Firebase Status: {status}</h3>
    </div>
  );
}

export default TestFirebase;