import {
  db,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "../firebaseConfig";

export const fetchFirestoreBalance = async (
  walletAddress: string
): Promise<number> => {
  try {
    const walletsRef = collection(db, "wallets");
    const q = query(walletsRef, where("walletAddress", "==", walletAddress));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userTokenDoc = querySnapshot.docs[0];
      const userData = userTokenDoc.data();
      return Number(userData.balance) || 0;
    } else {
      return 0;
    }
  } catch (error) {
    console.error("Error fetching Firestore balance:", error);
    return 0;
  }
};

export const updateFirestoreBalance = async (
  walletAddress: string,
  newBalance: number
) => {
  try {
    const walletsRef = collection(db, "wallets");
    const q = query(walletsRef, where("walletAddress", "==", walletAddress));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userTokenDoc = querySnapshot.docs[0];
      const userTokenRef = doc(db, "wallets", userTokenDoc.id);

      await updateDoc(userTokenRef, {
        balance: newBalance.toString(),
      });
    } else {
      throw new Error("No matching wallet found");
    }
  } catch (error) {
    console.error("Error updating Firestore balance:", error);
    throw error;
  }
};
