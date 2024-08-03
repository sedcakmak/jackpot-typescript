export const claimUSDCService = async (destinationAddress, depositAmount) => {
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
    const response = await fetch("/api/claim", {
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

export default claimUSDCService;
