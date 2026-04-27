import { useState, useEffect } from 'react';
import { rtdb, firestore } from '../api/firebaseConfig';
import { ref, onValue, update, get } from "firebase/database"; // Added 'get'
import { doc, updateDoc } from "firebase/firestore";

export const useHardwareSync = () => {
  const [sensorStatus, setSensorStatus] = useState("Offline");
  const [isOnline, setIsOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [targetStudent, setTargetStudent] = useState(null);

  const startEnrollment = async (student) => {
    setTargetStudent(student);
    setIsSyncing(true);
    
    try {
      await update(ref(rtdb, 'system_status'), {
        command: "enroll",
        targetId: student.id,
        sensorStatus: student.isBiometricRegistered 
          ? "Re-scanning Finger..." 
          : "Waiting for Finger...",
        biometricId: null 
      });
    } catch (error) {
      console.error("Failed to send enroll command:", error);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const statusRef = ref(rtdb, 'system_status');
    
    const unsubscribe = onValue(statusRef, async (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      setSensorStatus(data.sensorStatus || "Unknown");
      setIsOnline(data.isOnline || false);

      // --- BRIDGE LOGIC: DETECT SUCCESS ---
      if (data.sensorStatus === "Success!" && data.targetId) {
        try {
          // 1. Fetch the actual biometricId from the student's RTDB record
          // This ensures we get the ID written by the ESP32 to the specific user node
          const userRtdbRef = ref(rtdb, `users/${data.targetId}`);
          const userSnapshot = await get(userRtdbRef);
          const userData = userSnapshot.val();

          // Priority: ID from user node -> ID from system_status -> fallback to 1
          const finalBiometricId = userData?.biometricId || data.biometricId || 1;

          const studentDocRef = doc(firestore, "users", data.targetId);
          
          // 2. Update Firestore Master Record
          await updateDoc(studentDocRef, {
            isBiometricRegistered: true,
            biometricId: finalBiometricId,
            lastHardwareSync: new Date().toISOString()
          });

          console.log(`[Vantage] Firestore Sync Success: ID ${finalBiometricId} for ${data.targetId}`);

          // 3. Handshake Cleanup: Reset RTDB only AFTER Firestore is confirmed updated
          await update(ref(rtdb, 'system_status'), {
            command: "idle",
            targetId: null,
            sensorStatus: "Sync Complete"
          });

          setIsSyncing(false);
          setTargetStudent(null);
          
        } catch (error) {
          console.error("Bridge Error: Sync failed", error);
        }
      }

      if (data.command === "idle" && isSyncing) {
        setIsSyncing(false);
        setTargetStudent(null);
      }
    });

    return () => unsubscribe();
  }, [isSyncing]); // Keeps the listener active during syncing process

  return {
    sensorStatus,
    isOnline,
    isSyncing,
    targetStudent,
    startEnrollment,
  };
};