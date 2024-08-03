import express from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";
import { transferUSDC } from "../services/transferUSDC.js";
import {
  db,
  doc,
  setDoc,
  updateDoc,
  getDoc,
} from "../config/firebaseConfig.js";

import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

const circleDeveloperSdk = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.API_KEY,
  entitySecret: process.env.ENTITY_SECRET,
});

console.log(
  "Api key: " +
    process.env.API_KEY +
    "entity secret BURDA :" +
    process.env.ENTITY_SECRET
);

const router = express.Router();

// Setup developer sdk

// const circleDeveloperSdk = new Circle({
//   apiKey: process.env.API_KEY,
//   // baseUrl: pkg.CircleEnvironments.sandbox,veya 'https://api-sandbox.circle.com' // pkg.CircleEnvironments.production, for .production for live environment
// });

// console.log("SDK methods:", Object.keys(circleDeveloperSdk));

// console.log("Circle SDK package:", pkg);
// console.log("Circle class:", Circle);
// console.log("Initialized SDK:", circleDeveloperSdk);

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

// Check Balance

router.get("/check-balance/:id", async (req, res) => {
  const walletId = req.params.id;

  try {
    // Make a GET request to the Circle API to retrieve the balance of the wallet
    const response = await axios.get(
      `https://api.circle.com/v1/w3s/wallets/${walletId}/balances`,
      {
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Extract the balance from the response
    const balance = response.data.data;
    console.log("Wallet Balance:", balance);

    // Respond with the balance data
    res.json(balance);
  } catch (error) {
    console.error("Error checking balance:", error);
    res.status(500).json({ error: "Failed to check balance" });
  }
});

// Current user's wallet information

router.get("/current-wallet", async (req, res) => {
  try {
    const userToken = req.headers.authorization.split(" ")[1];

    if (!userToken) {
      return res.status(400).json({ error: "User token is missing" });
    }

    const walletDocRef = doc(db, "wallets", userToken);
    const walletDoc = await getDoc(walletDocRef);

    if (walletDoc.exists()) {
      const walletData = walletDoc.data();
      res.json({
        walletId: walletData.walletId,
        walletAddress: walletData.walletAddress,
      });
    } else {
      res.status(404).json({ error: "Wallet not found" });
    }
  } catch (error) {
    console.error("Error fetching current wallet:", error);
    res.status(500).json({ error: "Failed to fetch wallet info" });
  }
});

// Transfer

router.post("/transfer-usdc", async (req, res) => {
  console.log("Received transfer request:", req.body);

  try {
    const { walletAddress, amount } = req.body;
    console.log("Extracted data:", { walletAddress, amount });

    if (!walletAddress || !amount) {
      throw new Error("Missing walletAddress or amount");
    }

    const result = await transferUSDC(walletAddress, amount);
    console.log("Transfer result:", result);

    res.json(result);
  } catch (error) {
    console.error("Error transferring USDC:", error);
    res.status(500).json({ error: error.message });
  }
});

// Make Claim Transaction

router.post("/claim", async (req, res) => {
  console.log("Received claim request:", req.body);

  try {
    const { destinationAddress, depositAmount } = req.body;
    console.log("Parsed values:", { destinationAddress, depositAmount });
    console.log("Types:", {
      destinationAddressType: typeof destinationAddress,
      depositAmountType: typeof depositAmount,
    });

    console.log("Circle SDK:", circleDeveloperSdk);

    if (!destinationAddress) {
      return res.status(400).json({
        error: `Invalid destinationAddress: ${destinationAddress}`,
      });
    }

    const depositAmountNumber = Number(depositAmount);
    if (isNaN(depositAmountNumber) || depositAmountNumber <= 0) {
      return res.status(400).json({
        error: `Invalid depositAmount: ${depositAmount}`,
      });
    }

    if (!circleDeveloperSdk) {
      console.error("Circle SDK is not initialized");
      return res.status(500).json({
        error: "Internal server error: SDK not initialized",
      });
    }

    if (!circleDeveloperSdk) {
      console.error(" is not available on the SDK");
      return res.status(500).json({
        error: "Internal server error: SDK method not available",
      });
    }

    const sourceWalletId = process.env.SOURCE_WALLET_ID;
    const usdcTokenId = process.env.USDC_TOKEN_ID;

    if (!sourceWalletId || !usdcTokenId) {
      return res.status(500).json({
        error:
          "SOURCE_WALLET_ID or USDC_TOKEN_ID not set in environment variables",
      });
    }

    console.log("Attempting to create transaction with:", {
      walletId: sourceWalletId,
      tokenId: usdcTokenId,
      destinationAddress,
      amount: depositAmount.toString(),
    });

    const response = await circleDeveloperSdk.createTransaction({
      walletId: sourceWalletId,
      tokenId: usdcTokenId,
      destinationAddress: destinationAddress,
      amounts: [depositAmount.toString()],
      fee: {
        type: "level",
        config: {
          feeLevel: "MEDIUM",
        },
      },
    });

    console.log("Circle API response:", response);

    if (response && response.data && response.data.id) {
      res.json({ success: true, transactionId: response.data.id });
    } else {
      throw new Error("Unexpected response from Circle API");
    }
  } catch (error) {
    console.error("Claim error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
