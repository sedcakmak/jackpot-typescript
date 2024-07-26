// import axios from "axios";

// export const handleCreateWallet = async () => {
//   try {
//     // Call your backend to initiate wallet creation
//     const response = await axios.post(
//       "http://localhost:3001/api/create-wallet"
//     );

//     const { appId, userToken, encryptionKey, challengeId } = response.data;

//     // Use Circle's Web SDK to complete the wallet setup
//     // Note: You'll need to include Circle's SDK in your project

//     window.circle.initializeUser({
//       appId,
//       userToken,
//       encryptionKey,
//       challengeId,
//       onSuccess: () => {
//         console.log("Wallet created successfully");
//         // Handle success (e.g., update UI, store wallet info)
//       },
//       onError: (error) => {
//         console.error("Error creating wallet:", error);
//       },
//     });
//   } catch (error) {
//     console.error("Error initiating wallet creation:", error);
//   }
// };

import axios from "axios";
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

export const handleCreateWallet = async () => {
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

    sdk.execute(challengeId, (error: any, result: any) => {
      if (error) {
        console.log(
          `${error?.code?.toString() || "Unknown code"}: ${
            error?.message ?? "Error!"
          }`
        );
        return;
      }

      if (!result) {
        console.error("No result returned");
        return;
      }

      console.log(`Challenge: ${result.type}`);
      console.log(`Status: ${result.status}`);

      if (result.data && result.data.signature) {
        console.log(`Signature: ${result.data.signature}`);
      }

      console.log("Wallet created successfully");
    });
  } catch (error) {
    console.error("Error initiating wallet creation:", error);
  }
};
