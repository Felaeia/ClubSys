import { useState, useEffect, useCallback, useRef } from 'react';
import { groupService } from '../api/services/groupService';

/**
 * Professional Hook for managing the global ORSYS Organization Registry.
 * Fixed to resolve ESLint cascading render warnings.
 */
export const useGroupData = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isMounted = useRef(true);

  const fetchGroups = useCallback(async () => {
    // Reset states before fetching
    setIsLoading(true);
    setError(null);

    try {
      const data = await groupService.getAllGroups();
      
      // Ensure state is only updated if the component is still mounted
      if (isMounted.current) {
        setGroups(data);
        setIsLoading(false);
      }
    } catch (err) {
      if (isMounted.current) {
        setError("Synchronization failure: Unable to fetch organization registry.");
        setIsLoading(false);
        console.error("[GroupData Service Error]:", err);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    
    // Pattern: Define a local async function inside the effect
    const initFetch = async () => {
      await fetchGroups();
    };

    initFetch();

    return () => {
      isMounted.current = false;
    };
  }, [fetchGroups]);

  return { 
    groups, 
    isLoading, 
    error, 
    refreshGroups: fetchGroups 
  };
};