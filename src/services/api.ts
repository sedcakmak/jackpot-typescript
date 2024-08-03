import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

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
