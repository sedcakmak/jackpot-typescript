import dotenv from "dotenv";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";
import { db, collection, getDocs, query, where } from "../firebaseConfig";

dotenv.config();

const url = "https://api.circle.com/v1/w3s/user/transactions/transfer";

export const transferUSDC = async (walletAddress, amount) => {
  console.log("TRANSFERUSDC WORKING");
  // Step 1: Search Firestore for the Wallet Address
  const walletsRef = collection(db, "wallets");
  const q = query(walletsRef, where("walletAddress", "==", walletAddress));
  const querySnapshot = await getDocs(q);
  console.log("WALLETS REFF" + walletsRef);
  console.log("ADDRESSSSS: " + walletAddress);
  if (querySnapshot.empty) {
    throw new Error("No matching wallet found in the database.");
  }
  // Assuming there's only one matching document
  const walletDoc = querySnapshot.docs[0];
  const walletData = walletDoc.data();
  console.log("WALLET DATA FROM FIRESTORE", walletData);

  const { userToken, userId, walletId } = walletData;
  console.log("TRANSFER WORKING: " + userToken, userId, walletId, amount);
  try {
    const idempotencyKey = uuidv4();

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_KEY}`,
        "X-User-Token": userToken,
      },
      body: JSON.stringify({
        idempotencyKey: idempotencyKey,
        userId: userId,
        destinationAddress: process.env.ADDRESS_R,
        refId: "",
        amounts: [amount],
        feeLevel: "HIGH",
        tokenId: process.env.USDC_TOKEN_ID,
        walletId: walletId,
      }),
    };

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Transfer failed");
    }

    console.log("user token:", userToken);
    console.log("idempotency key:", idempotencyKey);
    console.log(data);

    return data;
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
};

export default transferUSDC;

// import axios from "axios";
// import { v4 as uuidv4 } from "uuid";
// import { db, collection, getDocs, query, where } from "../firebaseConfig";
// import dotenv from "dotenv";

// dotenv.config();

// export const transferUSDC = async (walletAddress, amount) => {
//   try {
//     // Step 1: Search Firestore for the Wallet Address
//     const walletsRef = collection(db, "wallets");
//     const q = query(walletsRef, where("walletAddress", "==", walletAddress));
//     const querySnapshot = await getDocs(q);

//     if (querySnapshot.empty) {
//       throw new Error("No matching wallet found in the database.");
//     }
//     // Assuming there's only one matching document
//     const walletDoc = querySnapshot.docs[0];
//     const walletData = walletDoc.data();
//     console.log("WALLET DATA FROM FIRESTORE", walletData);

//     const { userToken, userId, walletId } = walletData;
//     const destinationAddress = process.env.ADDRESS_R;
//     const tokenId = process.env.USDC_TOKEN_ID;

//     const options = {
//       method: "POST",
//       url: "https://api.circle.com/v1/w3s/user/transactions/transfer",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.API_KEY}`,
//         "X-User-Token": userToken,
//       },
//       data: {
//         idempotencyKey: uuidv4(),
//         userId: userId,
//         destinationAddress: destinationAddress,
//         refId: "Deposit",
//         amounts: [{ amount, currency: "USD" }],
//         feeLevel: "HIGH",
//         tokenId: tokenId,
//         walletId: walletId,
//       },
//     };

//     const response = await axios.request(options);
//     console.log("Deposit successful:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Error making deposit:", error);
//     throw error;
//   }
// };
