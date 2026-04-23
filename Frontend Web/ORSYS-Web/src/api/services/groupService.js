import { db } from '../../firebase/config';
// FIX: Added 'query', 'orderBy', and 'collection' to the imports
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

export const groupService = {
  /**
   * Fetches all student organizations (Groups) 
   * ordered by their acronym (e.g., CSO).
   */
  async getAllGroups() {
    try {
      const groupsRef = collection(db, 'groups');
      // The 'query' and 'orderBy' functions are now defined
      const q = query(groupsRef, orderBy('acronym', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
    } catch (error) {
      console.error("Vantage GroupService Error:", error);
      throw error;
    }
  }
};