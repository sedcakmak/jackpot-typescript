export const checkBalance = async (id: string): Promise<number> => {
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

    const usdcToken = data.tokenBalances?.find(
      (token: { token: { symbol: string }; amount: string }) =>
        token.token.symbol === "USDC"
    );
    return usdcToken ? parseFloat(usdcToken.amount) : 0;
  } catch (error) {
    console.error("Error checking balance:", error);
    return 0;
  }
};
