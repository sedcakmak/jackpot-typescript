// // src/api/wallet.ts

// export const checkBalance = async (id: string): Promise<boolean> => {
//   console.log("Checking balance for id:", id);
//   try {
//     const response = await fetch(
//       `http://localhost:3001/api/check-balance/${id}`
//     );
//     if (!response.ok) {
//       throw new Error("Error checking balance from backend");
//     }
//     const data = await response.json();
//     console.log("Balance check response:", data);

//     // Check if the response contains USDC token and if the amount is sufficient
//     return data.tokenBalances.some(
//       (token: { token: { symbol: string }; amount: string }) =>
//         token.token.symbol === "USDC" && parseFloat(token.amount) >= 0.5
//     );
//   } catch (error) {
//     console.error("Error checking balance:", error);
//     return false;
//   }
// };

// export const getBalance = async (id: string): Promise<number> => {
//   console.log("Getting balance for id:", id);
//   try {
//     const response = await fetch(
//       `http://localhost:3001/api/check-balance/${id}`
//     );
//     if (!response.ok) {
//       throw new Error("Error getting balance from backend");
//     }
//     const data = await response.json();
//     console.log("Balance check response:", data);

//     // Assuming the response format has the balance in tokenBalances
//     const usdcToken = data.tokenBalances.find(
//       (token: { token: { symbol: string }; amount: string }) =>
//         token.token.symbol === "USDC"
//     );
//     return usdcToken ? parseFloat(usdcToken.amount) : 0;
//   } catch (error) {
//     console.error("Error getting balance:", error);
//     return 0;
//   }
// };

// export const depositToDCW = async (
//   id: string,
//   amount: number
// ): Promise<void> => {
//   console.log(`Depositing ${amount} USDC from id: ${id} to DCW`);
//   // Replace with actual API call logic to your backend endpoint
// };

// export const createUCW = async (): Promise<void> => {
//   console.log("Creating a new UCW");
//   // Replace with actual API call logic to your backend endpoint
// };

// export const redirectToFaucet = (): void => {
//   console.log("Redirecting to Faucet");
//   // Replace with actual redirect logic
// };

// export const redirectToCircle = (): void => {
//   console.log("Redirecting to Circle to create an account");
//   // Replace with actual redirect logic
// };

export const checkBalance = async (id: string): Promise<boolean> => {
  console.log("Checking balance for id:", id);
  try {
    const response = await fetch(
      `http://localhost:3001/api/check-balance/${id}`
    );
    if (!response.ok) {
      throw new Error("Error checking balance from backend");
    }
    const data = await response.json();
    console.log("Balance check response:", data);

    // Assuming balanceData has a structure like { balance: { tokenBalances: [...] } }
    return data.balance.tokenBalances.some(
      (token: { token: { symbol: string }; amount: string }) =>
        token.token.symbol === "USDC" && parseFloat(token.amount) >= 0.5
    );
  } catch (error) {
    console.error("Error checking balance:", error);
    return false;
  }
};

export const getBalance = async (id: string): Promise<number> => {
  console.log("Getting balance for id:", id);
  try {
    const response = await fetch(
      `http://localhost:3001/api/check-balance/${id}`
    );
    if (!response.ok) {
      throw new Error("Error getting balance from backend");
    }
    const data = await response.json();
    console.log("Balance check response:", data);

    // Assuming balanceData has a structure like { balance: { tokenBalances: [...] } }
    const usdcToken = data.balance.tokenBalances.find(
      (token: { token: { symbol: string }; amount: string }) =>
        token.token.symbol === "USDC"
    );
    return usdcToken ? parseFloat(usdcToken.amount) : 0;
  } catch (error) {
    console.error("Error getting balance:", error);
    return 0;
  }
};
