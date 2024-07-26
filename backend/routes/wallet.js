import express from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

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
    console.error("Error initializing user account:");
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

export default router;
