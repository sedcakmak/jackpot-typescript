// // // // import express from "express";
// // // // import axios from "axios";

// // // // const router = express.Router();

// // // // // Helper functions to generate unique user IDs and idempotency keys
// // // // const generateUniqueUserId = () =>
// // // //   `user-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

// // // // const generateIdempotencyKey = () =>
// // // //   `idempotency-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

// // // // // router.post("/create-wallet", async (req, res) => {
// // // // //   try {
// // // // //     // Step 1: Create a new user
// // // // //     const userId = generateUniqueUserId();
// // // // //     const createUserResponse = await axios.post(
// // // // //       "https://api.circle.com/v1/w3s/users",
// // // // //       {
// // // // //         userId,
// // // // //       },
// // // // //       {
// // // // //         headers: { Authorization: `Bearer ${process.env.API_KEY}` },
// // // // //       }
// // // // //     );

// // // // //     // Step 2: Acquire a session token
// // // // //     const sessionResponse = await axios.post(
// // // // //       "https://api.circle.com/v1/w3s/users/token",
// // // // //       {
// // // // //         userId,
// // // // //       },
// // // // //       {
// // // // //         headers: {
// // // // //           "Content-Type": "application/json",
// // // // //           Authorization: `Bearer ${process.env.API_KEY}`,
// // // // //         },
// // // // //       }
// // // // //     );
// // // // //     console.log(
// // // // //       "Session token response:",
// // // // //       JSON.stringify(sessionResponse.data, null, 2)
// // // // //     );

// // // // //     if (!sessionResponse.data || !sessionResponse.data.userToken) {
// // // // //       throw new Error("Session token response is missing userToken.");
// // // // //     }

// // // // //     const { userToken, encryptionKey } = sessionResponse.data;
// // // // //     if (!userToken || !encryptionKey) {
// // // // //       throw new Error("Session token response is missing required fields.");
// // // // //     }
// // // // //     console.log("Session token acquired:", sessionResponse.data);

// // // // //     // Step 3: Initialize the user account
// // // // //     const initializeResponse = await axios.post(
// // // // //       "https://api.circle.com/v1/w3s/user/initialize",
// // // // //       {
// // // // //         idempotencyKey: generateIdempotencyKey(),
// // // // //         blockchains: ["MATIC-AMOY"],
// // // // //       },
// // // // //       {
// // // // //         headers: {
// // // // //           Authorization: `Bearer ${process.env.API_KEY}`,
// // // // //           "X-User-Token": userToken,
// // // // //         },
// // // // //       }
// // // // //     );

// // // // //     const { challengeId } = initializeResponse.data;

// // // // //     // Return necessary information to the frontend
// // // // //     res.json({
// // // // //       appId: process.env.APP_ID,
// // // // //       userToken,
// // // // //       encryptionKey,
// // // // //       challengeId,
// // // // //     });
// // // // //     console.log("User initialization successful:", initializeResponse.data);
// // // // //   } catch (error) {
// // // // //     console.error("Detailed error:", error);
// // // // //     res.status(500).json({
// // // // //       error: error.response ? error.response.data : error.message,
// // // // //     });
// // // // //   }
// // // // // });

// // import express from "express";
// // import axios from "axios";
// // import { v4 as uuidv4 } from "uuid";

// // const router = express.Router();

// // // Endpoint to create a wallet
// // router.post("/create-wallet", async (req, res) => {
// //   try {
// //     // Step 1: Create a new user
// //     const userId = uuidv4();
// //     //  console.log("USERID BUDUR: " + userId);
// //     //  console.log("Attempting to create user with Circle API...");

// //     const createUserResponse = await axios.post(
// //       "https://api.circle.com/v1/w3s/users",
// //       { userId },
// //       {
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${process.env.API_KEY}`,
// //         },
// //       }
// //     );
// //     console.log("Create user response status:", createUserResponse.status);
// //     console.log(
// //       "Create user response data:",
// //       JSON.stringify(createUserResponse.data, null, 2)
// //     );
// //     console.log(
// //       "Create user response headers:",
// //       JSON.stringify(createUserResponse.headers, null, 2)
// //     );

// //     if (createUserResponse.status !== 201) {
// //       // Circle API should return 201 for successful user creation
// //       throw new Error(
// //         `Failed to create user. Status: ${createUserResponse.status}`
// //       );
// //     }

// //     console.log(
// //       "User created successfully:",
// //       JSON.stringify(createUserResponse.data, null, 2)
// //     );

// //     // Step 2: Acquire a session token
// //     const sessionResponse = await axios.post(
// //       "https://api.circle.com/v1/w3s/users/token",
// //       { userId },
// //       {
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${process.env.API_KEY}`,
// //         },
// //       }
// //     );

// //     console.log(
// //       "Session response:",
// //       JSON.stringify(sessionResponse.data, null, 2)
// //     );

// //     if (
// //       !sessionResponse.data ||
// //       !sessionResponse.data.data ||
// //       !sessionResponse.data.data.userToken
// //     ) {
// //       throw new Error("Session token response is missing userToken.");
// //     }

// //     const { userToken, encryptionKey } = sessionResponse.data.data;
// //     console.log("Session token acquired:", { userToken, encryptionKey });

// //     // // Step 3: Initialize the user account
// //     // const initializeResponse = await axios.post(
// //     //   "https://api.circle.com/v1/w3s/user/initialize",
// //     //   {
// //     //     idempotencyKey: generateIdempotencyKey(),
// //     //     accountType: "SCA",
// //     //     blockchains: ["MATIC-AMOY"],
// //     //   },
// //     //   {
// //     //     headers: {
// //     //       "Content-Type": "application/json",
// //     //       Authorization: `Bearer ${process.env.API_KEY}`,
// //     //       "X-User-Token": userToken,
// //     //     },
// //     //   }
// //     // );

// //     // if (!initializeResponse.data || !initializeResponse.data.challengeId) {
// //     //   throw new Error("User initialization response is missing challengeId.");
// //     // }

// //     // const { challengeId } = initializeResponse.data;
// //     // console.log("User initialization successful:", initializeResponse.data);

// //     // Return necessary information to the frontend
// //     res.json({
// //       appId: process.env.APP_ID,
// //       userId: createUserResponse.data.data.id,
// //       userToken,
// //       encryptionKey,
// //       // challengeId,
// //     });
// //   } catch (error) {
// //     console.error("Error in create-wallet route:");
// //     if (error.response) {
// //       // The request was made and the server responded with a status code
// //       // that falls out of the range of 2xx
// //       console.error("Response status:", error.response.status);
// //       console.error(
// //         "Response data:",
// //         JSON.stringify(error.response.data, null, 2)
// //       );
// //       console.error(
// //         "Response headers:",
// //         JSON.stringify(error.response.headers, null, 2)
// //       );
// //     } else if (error.request) {
// //       // The request was made but no response was received
// //       console.error("No response received:", error.request);
// //     } else {
// //       // Something happened in setting up the request that triggered an Error
// //       console.error("Error message:", error.message);
// //     }
// //     console.error("Error config:", JSON.stringify(error.config, null, 2));

// //     res
// //       .status(500)
// //       .json({ error: "Failed to create wallet", details: error.message });
// //   }
// // });

// // export default router;

// // import express from "express";
// // import axios from "axios";
// // import { v4 as uuidv4 } from "uuid";

// // const router = express.Router();

// // router.post("/create-wallet", async (req, res) => {
// //   try {
// //     // Step 1: Create a new user (commented out)
// //     const userId = uuidv4();
// //     console.log("Generated userId:", userId);

// //     const createUserResponse = await axios.post(
// //       "https://api.circle.com/v1/w3s/users",
// //       { userId },
// //       {
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${process.env.API_KEY}`,
// //         },
// //       }
// //     );

// //     console.log(
// //       "User creation response:",
// //       JSON.stringify(createUserResponse.data, null, 2)
// //     );

// //     if (
// //       !createUserResponse.data ||
// //       !createUserResponse.data.data ||
// //       !createUserResponse.data.data.id
// //     ) {
// //       throw new Error("User creation failed or returned unexpected response.");
// //     }

// //     const createdUserId = createUserResponse.data.data.id;
// //     console.log("Created userId:", createdUserId);

// //     // Hardcoded user ID for testing
// //     // const userId = "3eae18c5-66c1-4ab3-b9cb-ab60e84d0847"; // Replace with an actual user ID from your console
// //     // console.log("Using hardcoded userId:", userId);

// //     // Step 2: Acquire a session token
// //     const sessionResponse = await axios.post(
// //       "https://api.circle.com/v1/w3s/users/token",
// //       { userId: createdUserId },
// //       {
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${process.env.API_KEY}`,
// //         },
// //       }
// //     );

// //     console.log(
// //       "Full session response:",
// //       JSON.stringify(sessionResponse.data, null, 2)
// //     );

// //     if (
// //       !sessionResponse.data ||
// //       !sessionResponse.data.data ||
// //       !sessionResponse.data.data.userToken
// //     ) {
// //       throw new Error("Session token response is missing userToken.");
// //     }

// //     const { userToken, encryptionKey } = sessionResponse.data.data;
// //     console.log("Session token acquired:", { userToken, encryptionKey });

// //     // Return necessary information to the frontend
// //     res.json({
// //       appId: process.env.APP_ID,
// //       userId: createdUserId,
// //       userToken,
// //       encryptionKey,
// //     });
// //   } catch (error) {
// //     console.error("Error in create-wallet route:");
// //     if (error.response) {
// //       console.error("Response status:", error.response.status);
// //       console.error(
// //         "Response data:",
// //         JSON.stringify(error.response.data, null, 2)
// //       );
// //       console.error(
// //         "Response headers:",
// //         JSON.stringify(error.response.headers, null, 2)
// //       );
// //     } else if (error.request) {
// //       console.error("No response received:", error.request);
// //     } else {
// //       console.error("Error message:", error.message);
// //     }
// //     console.error("Error config:", JSON.stringify(error.config, null, 2));

// //     res
// //       .status(500)
// //       .json({ error: "Failed to create wallet", details: error.message });
// //   }
// // });

// // export default router;

// // import express from "express";
// // import axios from "axios";
// // import { v4 as uuidv4 } from "uuid";

// // const router = express.Router();

// // const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// // router.post("/create-wallet", async (req, res) => {
// //   try {
// //     // Step 1: Create a new user
// //     const userId = uuidv4();
// //     console.log("Generated userId:", userId);

// //     const createUserResponse = await axios.post(
// //       "https://api.circle.com/v1/w3s/users",
// //       { userId },
// //       {
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${process.env.API_KEY}`,
// //         },
// //       }
// //     );

// //     console.log(
// //       "User creation response:",
// //       JSON.stringify(createUserResponse.data, null, 2)
// //     );

// //     const createdUserId = createUserResponse.data.data.id;
// //     console.log("Created userId:", createdUserId);

// //     // Add a delay of 2 seconds
// //     console.log("Waiting for 2 seconds before acquiring session token...");
// //     await delay(2000);

// //     // Step 2: Acquire a session token
// //     console.log(
// //       "Attempting to acquire session token for userId:",
// //       createdUserId
// //     );
// //     const sessionResponse = await axios.post(
// //       "https://api.circle.com/v1/w3s/users/token",
// //       { userId: createdUserId },
// //       {
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${process.env.API_KEY}`,
// //         },
// //       }
// //     );

// //     console.log(
// //       "Full session response:",
// //       JSON.stringify(sessionResponse.data, null, 2)
// //     );

// //     const { userToken, encryptionKey } = sessionResponse.data.data;
// //     console.log("Session token acquired:", { userToken, encryptionKey });

// //     // Return necessary information to the frontend
// //     res.json({
// //       appId: process.env.API_KEY,
// //       userId: createdUserId,
// //       userToken,
// //       encryptionKey,
// //     });
// //   } catch (error) {
// //     console.error("Error in create-wallet route:");
// //     if (error.response) {
// //       console.error("Response status:", error.response.status);
// //       console.error(
// //         "Response data:",
// //         JSON.stringify(error.response.data, null, 2)
// //       );
// //     } else if (error.request) {
// //       console.error("No response received:", error.request);
// //     } else {
// //       console.error("Error message:", error.message);
// //     }
// //     res
// //       .status(500)
// //       .json({ error: "Failed to create wallet", details: error.message });
// //   }
// // });

// // export default router;

// import express from "express";
// import axios from "axios";
// import { v4 as uuidv4 } from "uuid";

// const router = express.Router();

// const createUser = async (userId) => {
//   const createUserResponse = await axios.post(
//     "https://api.circle.com/v1/w3s/users",
//     { userId },
//     {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.API_KEY}`,
//       },
//     }
//   );
//   return createUserResponse.data.data.id;
// };

// const acquireSessionToken = async (userId) => {
//   const sessionResponse = await axios.post(
//     "https://api.circle.com/v1/w3s/users/token",
//     { userId },
//     {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.API_KEY}`,
//       },
//     }
//   );
//   return {
//     userToken: sessionResponse.data.data.userToken,
//     encryptionKey: sessionResponse.data.data.encryptionKey,
//   };
// };

// router.post("/create-wallet", async (req, res) => {
//   try {
//     // Step 1: Create a new user
//     const userId = uuidv4();
//     console.log("Generated userId:", userId);

//     const createdUserId = await createUser(userId);
//     console.log("Created userId:", createdUserId);

//     // Step 2: Acquire a session token
//     console.log(
//       "Attempting to acquire session token for userId:",
//       createdUserId
//     );
//     const { userToken, encryptionKey } = await acquireSessionToken(
//       createdUserId
//     );
//     console.log("Session token acquired:", { userToken, encryptionKey });

//     // Return necessary information to the frontend
//     res.json({
//       appId: process.env.APP_ID,
//       userId: createdUserId,
//       userToken,
//       encryptionKey,
//     });
//   } catch (error) {
//     console.error("Error in create-wallet route:", error);
//     res.status(500).json({
//       error: "Failed to create wallet",
//       message: error.message,
//       details: error.response ? error.response.data : undefined,
//     });
//   }
// });

// export default router;

// import express from "express";
// import axios from "axios";
// import { v4 as uuidv4 } from "uuid";

// const router = express.Router();

// const createUser = async (userId) => {
//   const createUserResponse = await axios.post(
//     "https://api.circle.com/v1/w3s/users",
//     { userId },
//     {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.API_KEY}`,
//       },
//     }
//   );
//   return createUserResponse.data.data.id;
// };

// const acquireSessionToken = async (userId) => {
//   const sessionResponse = await axios.post(
//     "https://api.circle.com/v1/w3s/users/token",
//     { userId },
//     {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.API_KEY}`,
//       },
//     }
//   );
//   return {
//     userToken: sessionResponse.data.data.userToken,
//     encryptionKey: sessionResponse.data.data.encryptionKey,
//   };
// };

// const initializeUserAccount = async (userToken) => {
//   console.log("Attempting to initialize user account...");
//   const initializeResponse = await axios.post(
//     "https://api.circle.com/v1/w3s/user/initialize",
//     {
//       idempotencyKey: uuidv4(), // Using uuidv4 as idempotencyKey
//       accountType: "SCA",
//       blockchains: ["MATIC-AMOY"],
//     },
//     {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.API_KEY}`,
//         "X-User-Token": userToken,
//       },
//     }
//   );
//   console.log(
//     "Initialization response:",
//     JSON.stringify(initializeResponse.data, null, 2)
//   );

//   return initializeResponse.data;
//     } catch (error) {
//     console.error("Error initializing user account:");
//     if (error.response) {
//       console.error("Response status:", error.response.status);
//       console.error("Response data:", JSON.stringify(error.response.data, null, 2));
//     } else {
//       console.error("Error:", error.message);
//     }
//     throw error; // Re-throw the error to be caught in the main try-catch block
//   }
// };

// router.post("/create-wallet", async (req, res) => {
//   try {
//     // Step 1: Create a new user
//     const userId = uuidv4();
//     console.log("Generated userId:", userId);

//     const createdUserId = await createUser(userId);
//     console.log("Created userId:", createdUserId);

//     // Step 2: Acquire a session token
//     console.log(
//       "Attempting to acquire session token for userId:",
//       createdUserId
//     );
//     const { userToken, encryptionKey } = await acquireSessionToken(
//       createdUserId
//     );
//     console.log("Session token acquired:", { userToken, encryptionKey });

//     // Step 3: Initialize the user account
//     console.log("Initializing user account...");
//     const initializeResult = await initializeUserAccount(userToken);
//     console.log("User initialization successful:", initializeResult);

//     // Return necessary information to the frontend
//     res.json({
//       appId: process.env.APP_ID,
//       userId: createdUserId,
//       userToken,
//       encryptionKey,
//       challengeId: initializeResult.data?.challengeId,
//     });
//   } catch (error) {
//     console.error("Error in create-wallet route:", error);
//     res.status(500).json({
//       error: "Failed to create wallet",
//       message: error.message,
//       details: error.response ? error.response.data : undefined,
//     });
//   }
// });

// export default router;

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
    console.log("Attempting to initialize user account...");
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
      //initializationResult: initializeResult, // Return the full initialization result
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
