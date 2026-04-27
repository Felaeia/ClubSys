// src/pages/quests/SystemObjectives.js
export const SYSTEM_QUESTS = [
  {
    id: "onboarding_profile",
    title: "Identity Initialization",
    description: "Complete your profile details to secure your Vantage ID.",
    xpReward: 150,
    currencyReward: 50,
    checkField: "isProfileComplete",
    type: "Social"
  },
  {
    id: "profile_visual",
    title: "Visual Identification",
    description: "Upload a profile picture to personalize your student dashboard.",
    xpReward: 100,
    currencyReward: 25,
    checkField: "hasProfilePic",
    type: "Social"
  },
  {
    id: "hardware_biometric",
    title: "Biometric Linkage",
    description: "Register your fingerprint via the ESP32 Node at the CSO Office.",
    xpReward: 500,
    currencyReward: 200,
    checkField: "isBiometricRegistered",
    type: "Technical"
  },
  {
    id: "first_blood_xp",
    title: "First Merit",
    description: "Earn your very first aclcXp point through any school activity.",
    xpReward: 50,
    currencyReward: 10,
    checkField: "hasEarnedFirstXp",
    type: "Achievement"
  },
  {
    id: "house_allegiance",
    title: "House Initiation",
    description: "Join your designated House to represent your department.",
    xpReward: 300,
    currencyReward: 100,
    checkField: "hasJoinedHouse",
    type: "Social"
  },
  {
    id: "club_membership",
    title: "Organization Scout",
    description: "Join a professional organization or interest club (e.g., CSO).",
    xpReward: 200,
    currencyReward: 50,
    checkField: "hasJoinedClub",
    type: "Social"
  },
  {
    id: "rank_tier_0",
    title: "Rising Star",
    description: "Reach 100 aclcXP. Your journey in the Vantage ecosystem has officially begun!",
    xpReward: 50,
    currencyReward: 25,
    checkField: "totalActivityPoints",
    threshold: 100, // Very easy to reach early on
    type: "Rank"
  },
  {
    id: "rank_tier_1",
    title: "Vanguard Initiate",
    description: "Reach 300 aclcXP. You are no longer just a face in the crowd.",
    xpReward: 100,
    currencyReward: 50,
    checkField: "totalActivityPoints",
    threshold: 300,
    type: "Rank"
  },
  {
    id: "rank_tier_2",
    title: "Elite Academician",
    description: "Reach 1,000 aclcXP. Your consistency is starting to get noticed.",
    xpReward: 250,
    currencyReward: 150,
    checkField: "totalActivityPoints",
    threshold: 1000,
    type: "Rank"
  },
  {
    id: "rank_tier_3",
    title: "Magna Luminary",
    description: "Reach 2,500 aclcXP. A beacon of excellence within the institution.",
    xpReward: 500,
    currencyReward: 300,
    checkField: "totalActivityPoints",
    threshold: 2500,
    type: "Rank"
  },
  {
    id: "rank_tier_4",
    title: "Master Achiever",
    description: "Reach 5,000 aclcXP. You have mastered the art of institutional engagement.",
    xpReward: 1000,
    currencyReward: 500,
    checkField: "totalActivityPoints",
    threshold: 5000,
    type: "Rank"
  },
  {
    id: "rank_tier_5",
    title: "Grand Chancellor",
    description: "Reach 10,000 aclcXP. The pinnacle of student leadership and merit.",
    xpReward: 2500,
    currencyReward: 1500,
    checkField: "totalActivityPoints",
    threshold: 10000,
    type: "Rank"
  }
];