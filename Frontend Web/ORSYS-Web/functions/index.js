const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

const SYSTEM_QUESTS = [
  {
    id: "onboarding_profile",
    title: "Identity Initialization",
    description: "Complete basic profile info.",
    xpReward: 150,
    currencyReward: 50,
    checkField: "isProfileComplete",
  },
  {
    id: "profile_visual",
    title: "Visual Identification",
    description: "Upload profile picture.",
    xpReward: 100,
    currencyReward: 25,
    checkField: "hasProfilePic",
  },
  {
    id: "hardware_biometric",
    title: "Biometric Linkage",
    description: "Register fingerprint via ESP32.",
    xpReward: 500,
    currencyReward: 200,
    checkField: "isBiometricRegistered",
  },
  {
    id: "house_initiation",
    title: "House Initiation",
    description: "Join your first school House.",
    xpReward: 300,
    currencyReward: 100,
    checkField: "hasJoinedHouse",
  },
  {
    id: "org_membership",
    title: "Organization Scout",
    description: "Join your first campus organization.",
    xpReward: 200,
    currencyReward: 50,
    checkField: "hasJoinedOrganization",
  },
  {
    id: "club_membership",
    title: "Club Member",
    description: "Join your first interest-based club.",
    xpReward: 200,
    currencyReward: 50,
    checkField: "hasJoinedClub",
  },
  {
    id: "rank_tier_0",
    title: "Rising Star",
    description: "Reach 100 ACLC XP.",
    xpReward: 50,
    currencyReward: 25,
    threshold: 100,
    type: "Rank",
  },
  {
    id: "rank_tier_1",
    title: "Vanguard Initiate",
    description: "Reach 300 ACLC XP.",
    xpReward: 100,
    currencyReward: 50,
    threshold: 300,
    type: "Rank",
  },
  {
    id: "rank_tier_2",
    title: "Elite Academician",
    description: "Reach 1,000 ACLC XP.",
    xpReward: 250,
    currencyReward: 150,
    threshold: 1000,
    type: "Rank",
  },
  {
    id: "rank_tier_3",
    title: "Magna Luminary",
    description: "Reach 2,500 ACLC XP.",
    xpReward: 500,
    currencyReward: 300,
    threshold: 2500,
    type: "Rank",
  },
  {
    id: "rank_tier_4",
    title: "Master Achiever",
    description: "Reach 5,000 ACLC XP.",
    xpReward: 1000,
    currencyReward: 500,
    threshold: 5000,
    type: "Rank",
  },
  {
    id: "rank_tier_5",
    title: "Grand Chancellor",
    description: "Reach 10,000 ACLC XP.",
    xpReward: 2500,
    currencyReward: 1500,
    threshold: 10000,
    type: "Rank",
  },
];

/**
 * Checks if user meets specific Orsys requirements.
 * @param {Object} quest The quest definition.
 * @param {Object} userData The user document data.
 * @param {number} currentXP The user's current activity points.
 * @return {boolean} True if the user is eligible for the reward.
 */
function isEligible(quest, userData, currentXP) {
  if (quest.threshold !== undefined) {
    return currentXP >= quest.threshold;
  }
  return userData[quest.checkField] === true;
}

exports.processQuestRewards = functions.firestore
    .document("users/{userId}")
    .onUpdate(async (change, context) => {
      const beforeData = change.before.data();
      const afterData = change.after.data();
      const {userId} = context.params;

      // 1. RECURSION GUARD
      const timeBefore = beforeData.lastQuestAwarded ?
        beforeData.lastQuestAwarded.toMillis() : 0;
      const timeAfter = afterData.lastQuestAwarded ?
        afterData.lastQuestAwarded.toMillis() : 0;
      if (timeAfter > timeBefore) return null;

      // 2. TRIGGER FILTER: Watches relevant boolean and XP fields.
      const triggerFields = [
        "aclcXp",
        "isProfileComplete",
        "hasProfilePic",
        "isBiometricRegistered",
        "hasJoinedHouse",
        "hasJoinedClub",
        "hasJoinedOrganization",
      ];

      const hasRelevantChange = triggerFields.some((field) =>
        JSON.stringify(beforeData[field]) !== JSON.stringify(afterData[field]));
      if (!hasRelevantChange) return null;

      try {
        await db.runTransaction(async (transaction) => {
          const userRef = change.after.ref;
          const completed = afterData.completedQuests || [];

          let runningXP = afterData.aclcXp || 0;
          let totalXpToGain = 0;
          let totalCoinsToGain = 0;
          let newRank = afterData.rank || "";
          const newlyCompleted = [];

          for (const quest of SYSTEM_QUESTS) {
            if (completed.includes(quest.id)) continue;

            if (isEligible(quest, afterData, runningXP)) {
              newlyCompleted.push(quest.id);

              // Increment local accumulators
              runningXP += quest.xpReward;
              totalXpToGain += quest.xpReward;
              totalCoinsToGain += quest.currencyReward;

              // 5. RANK LOGIC: Identify highest earned rank title.
              if (quest.type === "Rank") {
                newRank = quest.title;
              }
            }
          }

          // 6. COMMIT TRANSACTION: Applies summed rewards in one operation.
          if (newlyCompleted.length > 0) {
            const finalUpdates = {
              aclcXp: admin.firestore.FieldValue.increment(totalXpToGain),
              orsysCoin: admin.firestore.FieldValue.increment(totalCoinsToGain),
              completedQuests:
               admin.firestore.FieldValue.arrayUnion(...newlyCompleted),
              lastQuestAwarded: admin.firestore.FieldValue.serverTimestamp(),
            };

            if (newRank !== afterData.rank) {
              finalUpdates.rank = newRank;
            }

            transaction.update(userRef, finalUpdates);
          }
        });

        console.log(`[Orsys Engine] Rewards minted for: ${userId}`);
        return {success: true};
      } catch (error) {
        console.error("[Orsys Engine] Transaction Error:", error);
        return {success: false};
      }
    });
