import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

export const transferUSDC = async (walletAddress: string, amount: string) => {
  console.log("Initiating USDC transfer from frontend");
  console.log("Transfer details:", { walletAddress, amount });
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/transfer-usdc`,
      { walletAddress, amount },
      {
        headers: {
          "Content-Type": "application/json",
          // "X-User-Token": userToken,
        },
      }
    );
    console.log("Received response from server:", response.data);

    if (response.status !== 200) {
      throw new Error("Transfer failed");
    }

    console.log("Transfer successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error transferring USDC:", error);
    throw error;
  }
};
