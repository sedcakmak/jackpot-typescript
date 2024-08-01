import React, { useState } from "react";
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

interface TransferComponentProps {
  appId: string;
  walletAddress: string;
}

interface AuthenticationData {
  userToken: string;
  encryptionKey: string;
}

const TransferComponent: React.FC<TransferComponentProps> = ({
  appId,
  walletAddress,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [authData, setAuthData] = useState<AuthenticationData | null>(null);

  const initiateTransfer = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/transfer-usdc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress }),
      });
      const data = await response.json();
      if (data.status === "challenge_required") {
        setChallengeId(data.challengeId);
        setAuthData({
          userToken: data.userToken,
          encryptionKey: data.encryptionKey,
        });
      } else {
        console.log("Transfer successful:", data);
        // Handle successful transfer
      }
    } catch (err) {
      setError("Failed to initiate transfer");
      console.error("Error initiating transfer:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChallenge = async () => {
    if (!challengeId || !authData) {
      console.error("Missing challenge ID or authentication data");
      return;
    }

    const sdk = new W3SSdk({
      appSettings: {
        appId: appId,
      },
    });

    sdk.setAuthentication(authData);

    sdk.execute(challengeId, (error, result) => {
      if (error) {
        console.error("Challenge execution failed:", error);
        setError("PIN entry failed");
        return;
      }
      console.log("Challenge execution result:", result);
      // Handle successful challenge execution
      // You might want to check the transfer status again here
    });
  };

  return (
    <div>
      <button
        onClick={initiateTransfer}
        disabled={loading}
      >
        {loading ? "Initiating Transfer..." : "Transfer USDC"}
      </button>
      {challengeId && <button onClick={handleChallenge}>Enter PIN</button>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default TransferComponent;
