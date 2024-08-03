export const checkBalance = async (id: string): Promise<number> => {
  try {
    const response = await fetch(
      `http://localhost:3001/api/check-balance/${id}`
    );
    if (!response.ok) {
      throw new Error("Error checking balance from backend");
    }
    const data = await response.json();

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
