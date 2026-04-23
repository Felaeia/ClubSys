// src/hooks/useMembershipData.js
import { useState, useEffect } from 'react';
import { membershipService } from '../api/services/membershipService';

export const useMembershipData = (userId) => {
  const [memberships, setMemberships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. If no userId yet, don't just hang—check if we're still waiting or done
    if (!userId) {
      // Small delay to allow Auth to settle, then stop loading
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    }

    const loadData = async () => {
      try {
        const data = await membershipService.getUserMemberships(userId);
        setMemberships(data || []);
      } catch (error) {
        console.error("Data Fetch Failed:", error);
        setMemberships([]); // Reset to empty on error
      } finally {
        setIsLoading(false); // CRITICAL: This MUST run to clear the screen
      }
    };

    loadData();
  }, [userId]);

  return { memberships, isLoading };
};