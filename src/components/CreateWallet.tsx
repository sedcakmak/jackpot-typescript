import axios from "axios";

export const handleCreateWallet = async () => {
  try {
    console.log("handleCreateWallet called"); // Debug log

    // Call your backend to initiate wallet creation
    const response = await axios.post(
      "http://localhost:3001/api/create-wallet"
    );

    console.log("API response:", response.data); // Debug log

    // The response should contain the necessary info to complete the process
    const { appId, userToken, encryptionKey, challengeId } = response.data;

    // Use Circle's Web SDK to complete the wallet setup
    // Note: You'll need to include Circle's SDK in your project
    window.circle.initializeUser({
      appId,
      userToken,
      encryptionKey,
      challengeId,
      onSuccess: () => {
        console.log("Wallet created successfully");
        // Handle success (e.g., update UI, store wallet info)
      },
      onError: (error) => {
        console.error("Error creating wallet:", error);
        // Handle error
      },
    });
  } catch (error) {
    console.error("Error initiating wallet creation:", error);
    // Handle error
  }
};
