import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

export const membershipService = {
  async getUserMemberships(userId) {
    const mRef = collection(db, 'memberships');
    const q = query(mRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    return Promise.all(snapshot.docs.map(async (mDoc) => {
      const mData = mDoc.data();
      // Fetch the corresponding group data (e.g., CSO)
      const groupRef = doc(db, 'groups', mData.groupId);
      const groupSnap = await getDoc(groupRef);
      
      return {
        id: mDoc.id,
        ...mData, // Includes displayTitle, pointsBalance, totalPointsGained
        group: groupSnap.exists() ? groupSnap.data() : null // Includes acronym, currencyLogoUrl
      };
    }));
  }
};