import axios from "axios";
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

export interface WalletInfo {
  id: string;
  state: string;
  address: string;
  blockchain: string;
  createDate: string;
  userToken: string;
  challengeId: string;
  userId: string;
  encryptionKey: string;
}

export const handleCreateWallet = async (): Promise<WalletInfo | null> => {
  try {
    const response = await axios.post(
      "http://localhost:3001/api/create-wallet"
    );

    const { appId, userToken, encryptionKey, challengeId, userId } =
      response.data;

    const sdk = new W3SSdk({
      appSettings: {
        appId,
      },
    });

    sdk.setAuthentication({
      userToken,
      encryptionKey,
    });

    return new Promise((resolve, reject) => {
      sdk.execute(challengeId, async (error: any, result: any) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          console.error("No result returned");
          reject(new Error("No result returned"));
          return;
        }

        // Waiting to ensure the wallet is fully processed on Circle's side
        await new Promise((resolve) => setTimeout(resolve, 5000));

        try {
          const walletInfo = await getWalletInfo(userToken);
          if (walletInfo) {
            resolve({
              ...walletInfo,
              userToken,
              challengeId,
              userId: response.data.userId,
              encryptionKey,
            });
          } else {
            reject(new Error("Failed to get wallet info"));
          }
        } catch (walletInfoError) {
          console.error("Error fetching wallet info:", walletInfoError);
          reject(walletInfoError);
        }
      });
    });
  } catch (error) {
    console.error("Error initiating wallet creation:", error);
    throw error;
  }
};

export const getWalletInfo = async (
  userToken: string
): Promise<WalletInfo | null> => {
  try {
    const response = await axios.get(`http://localhost:3001/api/wallet-info/`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching wallet info:", error);
    throw error;
  }
};
