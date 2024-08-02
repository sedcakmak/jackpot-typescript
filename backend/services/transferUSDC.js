import dotenv from "dotenv";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";
import {
  db,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "../config/firebaseConfig.js";

dotenv.config();

const acquireSessionToken = async (userId) => {
  const url = "https://api.circle.com/v1/w3s/users/token";
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.API_KEY}`,
    },
    body: JSON.stringify({ userId }),
  };

  const response = await fetch(url, options);
  const data = await response.json();
  console.log("New session token acquired:", data.data);

  return {
    userToken: data.data.userToken,
    encryptionKey: data.data.encryptionKey,
  };
};

export const transferUSDC = async (walletAddress, amount) => {
  console.log("TRANSFERUSDC WORKING");
  console.log("Params:", { walletAddress, amount });
  console.log("Amount type:", typeof amount);
  console.log("Amount value:", amount);

  if (!walletAddress || amount === undefined || amount === null) {
    throw new Error(
      `Invalid walletAddress or amount.  WalletAddress: ${walletAddress}, Amount: ${amount}`
    );
  }

  // Step 1: Search Firestore for the Wallet Address
  const walletsRef = collection(db, "wallets");
  const q = query(walletsRef, where("walletAddress", "==", walletAddress));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    console.log("No matching wallet found in the database.");
    const allWalletsSnapshot = await getDocs(walletsRef);
    allWalletsSnapshot.forEach((doc) => {
      console.log("Wallet:", doc.id, doc.data().walletAddress);
    });
    throw new Error(
      `No matching wallet found in the database for address: ${walletAddress}`
    );
  }

  const walletDoc = querySnapshot.docs[0];
  const walletData = walletDoc.data();
  console.log("WALLET DATA FROM FIRESTORE", walletData);

  const { userId, walletId } = walletData;

  try {
    const idempotencyKey = uuidv4();
    const { userToken: newUserToken, encryptionKey: newEncryptionKey } =
      await acquireSessionToken(userId);
    const url = "https://api.circle.com/v1/w3s/user/transactions/transfer";

    const requestBody = {
      idempotencyKey: idempotencyKey,
      userId: userId,
      destinationAddress: process.env.ADDRESS_R,
      refId: "",
      amounts: [amount.toString()],
      feeLevel: "HIGH",
      tokenId: process.env.USDC_TOKEN_ID,
      walletId: walletId,
    };

    console.log("Transfer request body:", JSON.stringify(requestBody));

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_KEY}`,
        "X-User-Token": newUserToken,
      },
      body: JSON.stringify(requestBody),
    };

    const response = await fetch(url, options);
    const data = await response.json();
    console.log("Circle API response status:", response.status);
    console.log("Circle API response data:", data);

    if (!response.ok) {
      throw new Error(data.message || "Transfer failed");
    }

    console.log("Transfer initiated:", data);

    if (data.data && data.data.challengeId) {
      console.log("Challenge received. ChallengeId:", data.data.challengeId);

      // Here you would typically return the challengeId to the frontend
      // where the Circle Web SDK would be used to complete the challenge

      // Update Firestore with the new balance
      // const newBalance =
      //   parseFloat(walletData.balance || 0) + parseFloat(amount);
      // await updateDoc(doc(db, "wallets", walletDoc.id), {
      //   balance: newBalance,
      // });

      return {
        status: "challenge_required",
        challengeId: data.data.challengeId,
        userToken: newUserToken,
        encryptionKey: newEncryptionKey,
      };
    }
    console.log(
      "Sending back encryption key:",
      newEncryptionKey || walletData.encryptionKey
    );
    // If no challenge is required (unlikely in this case)
    return {
      status: "success",
      data: data,
    };
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
};

export default transferUSDC;
