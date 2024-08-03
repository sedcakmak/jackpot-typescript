import dotenv from "dotenv";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

export const claimUSDC = async (
  destinationAddress,
  amount
  // userToken
) => {
  console.log("CLAIMUSDC WORKING");
  console.log("Destination:", destinationAddress);
  console.log("Amount:", amount);

  if (
    !destinationAddress ||
    amount === undefined ||
    amount === null ||
    amount <= 0
  ) {
    throw new Error(
      `Invalid parameters. Destination: ${destinationAddress}, Amount: ${amount}`
    );
  }

  try {
    const url = "https://api.circle.com/v1/w3s/user/transactions/transfer";

    const requestBody = {
      idempotencyKey: uuidv4(),
      tokenId: process.env.USDC_TOKEN_ID,
      walletId: process.env.SOURCE_WALLET_ID,
      destinationAddress: destinationAddress,
      amounts: [amount.toString()],
      feeLevel: "MEDIUM",
    };

    console.log("Claim request body:", JSON.stringify(requestBody, null, 2));

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.API_KEY}`,
        // "X-User-Token": userToken,
      },
      body: JSON.stringify(requestBody),
    };

    const response = await fetch(url, options);
    const data = await response.json();
    console.log("Circle API response status:", response.status);
    console.log("Circle API response data:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    console.log("Claim initiated:", data);

    return {
      status: "success",
      data: data,
    };
  } catch (error) {
    console.error("Error:", error.message);
    throw error;
  }
};

export default claimUSDC;
