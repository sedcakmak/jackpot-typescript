import express from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";
import { transferUSDC } from "../services/transferUSDC.js";

import {
  db,
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  increment,
  query,
  where,
} from "../config/firebaseConfig.js";

const router = express.Router();

const createUser = async (userId) => {
  const createUserResponse = await axios.post(
    "https://api.circle.com/v1/w3s/users",
    { userId },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
    }
  );
  return createUserResponse.data.data.id;
};

const acquireSessionToken = async (userId) => {
  const sessionResponse = await axios.post(
    "https://api.circle.com/v1/w3s/users/token",
    { userId },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
    }
  );
  return {
    userToken: sessionResponse.data.data.userToken,
    encryptionKey: sessionResponse.data.data.encryptionKey,
  };
};

const initializeUserAccount = async (userToken) => {
  try {
    const initializeResponse = await axios.post(
      "https://api.circle.com/v1/w3s/user/initialize",
      {
        idempotencyKey: uuidv4(),
        accountType: "SCA",
        blockchains: ["MATIC-AMOY"],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_KEY}`,
          "X-User-Token": userToken,
        },
      }
    );
    console.log(
      "Initialization response:",
      JSON.stringify(initializeResponse.data, null, 2)
    );
    return initializeResponse.data;
  } catch (error) {
    console.error("Error initializing user account:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2)
      );
    } else {
      console.error("Error:", error.message);
    }
    throw error;
  }
};

router.post("/create-wallet", async (req, res) => {
  try {
    // Step 1: Create a new user

    const userId = uuidv4();
    console.log("Generated userId:", userId);

    const createdUserId = await createUser(userId);
    console.log("Created userId:", createdUserId);

    // Step 2: Acquire a session token
    console.log(
      "Attempting to acquire session token for userId:",
      createdUserId
    );

    const { userToken, encryptionKey } = await acquireSessionToken(
      createdUserId
    );
    console.log("Session token acquired:", { userToken, encryptionKey });

    // Step 3: Initialize the user account
    console.log("Initializing user account...");
    const initializeResult = await initializeUserAccount(userToken);
    console.log("User initialization result:", initializeResult);

    // Store data in Firestore

    try {
      const initialWalletData = {
        appId: process.env.APP_ID,
        userId: createdUserId,
        userToken: userToken,
        encryptionKey: encryptionKey,
        challengeId: initializeResult.data.challengeId,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "wallets", userToken), initialWalletData);
      console.log(
        "Initial wallet data stored in Firestore for userId",
        createdUserId
      );
    } catch (firestoreError) {
      console.error("Error storing wallet data in Firestore:", firestoreError);
    }

    // Return necessary information to the frontend

    res.json({
      appId: process.env.APP_ID,
      userId: createdUserId,
      userToken,
      encryptionKey,
      challengeId: initializeResult.data.challengeId,
    });
  } catch (error) {
    console.error("Error in create-wallet route:", error);
    res.status(500).json({
      error: "Failed to create wallet",
      message: error.message,
      details: error.response ? error.response.data : undefined,
    });
  }
});

router.get("/wallet-info", async (req, res) => {
  try {
    const userToken = req.headers.authorization.split(" ")[1];

    if (!userToken) {
      return res.status(400).json({ error: "User token is missing" });
    }

    const response = await axios.get("https://api.circle.com/v1/w3s/wallets", {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
        "X-User-Token": userToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const wallets = response.data.data.wallets;
    if (wallets && wallets.length > 0) {
      const latestWallet = wallets[0];

      // Log the wallet information
      console.log("Wallet Info:", {
        id: latestWallet.id,
        state: latestWallet.state,
        address: latestWallet.address,
        blockchain: latestWallet.blockchain,
        createDate: latestWallet.createDate,
      });

      // Update Firestore with id and address corresponding to the userId
      const walletDocRef = doc(db, "wallets", userToken);
      await updateDoc(walletDocRef, {
        walletId: latestWallet.id,
        walletAddress: latestWallet.address,
      });
      console.log(
        "Updated Firestore with walletId and address for userToken",
        userToken
      );

      res.json({
        id: latestWallet.id,
        state: latestWallet.state,
        address: latestWallet.address,
        blockchain: latestWallet.blockchain,
        createDate: latestWallet.createDate,
      });
    } else {
      res.status(404).json({ error: "No wallet found" });
    }
  } catch (error) {
    console.error("Error fetching wallet info:", error);
    res.status(500).json({ error: "Failed to fetch wallet info" });
  }
});

router.post("/transfer-usdc", async (req, res) => {
  console.log("Received transfer request:", req.body);

  const { walletAddress } = req.body;
  console.log("Extracted data:", { walletAddress });

  try {
    const result = await transferUSDC(walletAddress);
    console.log("Transfer result:", result);

    res.json(result);
  } catch (error) {
    console.error("Error transferring USDC:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
