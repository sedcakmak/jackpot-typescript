import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

// TransferUSDC from newly created wallet to Piggybank
export const transferUSDC = async (walletAddress: string, amount: string) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/transfer-usdc`,
      { walletAddress, amount },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status !== 200) {
      throw new Error("Transfer failed");
    }

    return response.data;
  } catch (error) {
    console.error("Error transferring USDC:", error);
    throw error;
  }
};

// Claim the money from Piggybank
export const claimUSDC = async (
  destinationAddress: string,
  depositAmount: number
) => {
  if (
    !destinationAddress ||
    depositAmount === undefined ||
    depositAmount === null ||
    depositAmount <= 0
  ) {
    throw new Error(
      `Invalid destinationAddress or amount. Address: ${destinationAddress}, Amount: ${depositAmount}`
    );
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/claim`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destinationAddress,
        depositAmount,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Claim failed. Response:", errorData);
      throw new Error(errorData.error || "Claim failed");
    }

    const data = await response.json();

    return {
      status: "success",
      data: data,
    };
  } catch (error) {
    console.error("Error during USDC claim:", error);
    throw error;
  }
};

export default claimUSDC;
