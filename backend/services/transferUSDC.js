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
  console.log("New session token acquired:", data.data);

  return data.data;
};

export const transferUSDC = async (walletAddress) => {
  console.log("TRANSFERUSDC WORKING");
  console.log("Params:", { walletAddress });
  // export const transferUSDC = async (walletAddress, amount, userToken) => {
  //   console.log("TRANSFERUSDC WORKING");
  //   console.log("Params:", { walletAddress, amount, userToken });

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
    const { userToken: newUserToken } = await acquireSessionToken(userId);
    const url = "https://api.circle.com/v1/w3s/user/transactions/transfer";

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_KEY}`,
        "X-User-Token": newUserToken,
      },
      body: JSON.stringify({
        idempotencyKey: idempotencyKey,
        userId: userId,
        destinationAddress: walletAddress,
        // destinationAddress: process.env.ADDRESS_R,
        refId: "",
        //  amounts: [amount],
        amounts: ["0.1"],
        feeLevel: "HIGH",
        tokenId: process.env.USDC_TOKEN_ID,
        walletId: walletId,
      }),
    };

    const response = await fetch(url, options);
    const data = await response.json();
    console.log("Circle API response status:", response.status);
    console.log("Circle API response data:", data);
    console.log("Attempting to transfer amount:");

    if (!response.ok) {
      throw new Error(data.message || "Transfer failed");
    }

    console.log("Transfer successful:", data);
    return data;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
};

export default transferUSDC;
