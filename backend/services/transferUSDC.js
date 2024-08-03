import dotenv from "dotenv";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";
import {
  db,
  collection,
  getDocs,
  query,
  where,
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

  return {
    userToken: data.data.userToken,
    encryptionKey: data.data.encryptionKey,
  };
};

export const transferUSDC = async (walletAddress, amount) => {
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
    const allWalletsSnapshot = await getDocs(walletsRef);
    allWalletsSnapshot.forEach((doc) => {});
    throw new Error(
      `No matching wallet found in the database for address: ${walletAddress}`
    );
  }

  const walletDoc = querySnapshot.docs[0];
  const walletData = walletDoc.data();

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

    if (!response.ok) {
      throw new Error(data.message || "Transfer failed");
    }
    if (data.data && data.data.challengeId) {
      return {
        status: "challenge_required",
        challengeId: data.data.challengeId,
        userToken: newUserToken,
        encryptionKey: newEncryptionKey,
      };
    }

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
