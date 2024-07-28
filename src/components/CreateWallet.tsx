import axios from "axios";
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

export interface WalletInfo {
  id: string;
  state: string;
  address: string;
  blockchain: string;
  createDate: string;
}

export const handleCreateWallet = async (): Promise<WalletInfo | null> => {
  try {
    const response = await axios.post(
      "http://localhost:3001/api/create-wallet"
    );

    const { appId, userToken, encryptionKey, challengeId } = response.data;

    const sdk = new W3SSdk({
      appSettings: {
        appId,
      },
    });

    sdk.setAuthentication({
      userToken,
      encryptionKey,
    });

    console.log("About to execute SDK challenge");

    return new Promise((resolve, reject) => {
      sdk.execute(challengeId, async (error: any, result: any) => {
        if (error) {
          console.log(
            `${error?.code?.toString() || "Unknown code"}: ${
              error?.message ?? "Error!"
            }`
          );
          reject(error);
          return;
        }

        if (!result) {
          console.error("No result returned");
          reject(new Error("No result returned"));
          return;
        }

        console.log(`Challenge: ${result.type}`);
        console.log(`Status: ${result.status}`);

        if (result.data && result.data.signature) {
          console.log(`Signature: ${result.data.signature}`);
        }

        console.log("Wallet created successfully");

        // Waiting to ensure the wallet is fully processed on Circle's side
        await new Promise((resolve) => setTimeout(resolve, 5000));

        try {
          const walletInfo = await getWalletInfo(userToken);
          resolve(walletInfo);
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
