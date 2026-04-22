import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

const fetchUserFirstName = async () => {
  // 1. Reference the specific document in the 'users' collection
  const docRef = doc(db, "users", "1IAXxMaQ4kPEgoHeLvu3ohCL5Pn1");
  
  try {
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // 2. Extract the data
      const userData = docSnap.data();
      const firstName = userData.firstName;
      
      console.log("Found him! First Name:", firstName);
      return firstName;
    } else {
      console.log("No such student exists in the records!");
    }
  } catch (error) {
    console.error("Fetch failed, Proponent:", error);
  }
};

// Execute the mission
fetchUserFirstName();