import dotenv from "dotenv";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const url = "https://api.circle.com/v1/w3s/user/transactions/transfer";

const transferUSDC = async (userToken, walletId, amount, userId) => {
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
