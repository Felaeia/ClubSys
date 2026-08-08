import { db } from '../../api/firebaseConfig';
import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';
import { SYSTEM_QUESTS } from './SystemObjectives';

/**
 * Clean helper to determine eligibility without nesting.
 * This keeps Cognitive Complexity low.
 */
const isEligibleForQuest = (quest, userData, currentXP) => {
  // If it's a rank/threshold quest, check the number
  if (quest.type === "Rank" || quest.threshold !== undefined) {
    return currentXP >= quest.threshold;
  }
  
  // Otherwise, check the boolean field
  return userData[quest.checkField] === true;
};

/**
 * @param {DocumentSnapshot} userDoc - Real-time snapshot of the user's document
 */
export const checkQuestEligibility = async (userDoc) => {
  if (!userDoc.exists()) return;

  const userData = userDoc.data();
  const userId = userDoc.id;
  const completedQuests = userData.completedQuests || [];
  const currentXP = userData.stats?.totalActivityPoints || 0;

  for (const quest of SYSTEM_QUESTS) {
    // GUARD 1: Skip already completed quests
    if (completedQuests.includes(quest.id)) continue;

    // GUARD 2: Skip if requirements aren't met
    if (!isEligibleForQuest(quest, userData, currentXP)) continue;

    try {
      const userRef = doc(db, 'users', userId);

      // Perform atomic update
      await updateDoc(userRef, {
        completedQuests: arrayUnion(quest.id),
        "stats.totalActivityPoints": increment(quest.xpReward),
        "stats.totalCurrencyBalance": increment(quest.currencyReward || 0),
        
        // Conditional Rank Update
        ...(quest.type === "Rank" && { 
          "stats.currentRank": quest.title,
          "stats.rankAura": "unlocked" 
        }),

        lastAchievementEarned: quest.title,
        lastUpdated: serverTimestamp()
      });

      console.log(`🏆 [VANTAGE]: ${quest.title} unlocked!`);
    } catch (error) {
      console.error(`Award Error [${quest.id}]:`, error);
    }
  }
};