import React, { useState, useEffect } from "react";
import axios from "axios";

interface WalletInfo {
  appId: string;
  userId: string;
  userToken: string;
  encryptionKey: string;
  challengeId: string;
}

const ShowInfo: React.FC = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchWalletInfo = async () => {
      try {
        const response = await axios.post("/api/create-wallet");
        setWalletInfo(response.data);
        console.log("Fetched wallet info:", response.data);
      } catch (err) {
        setError("Failed to fetch wallet information");
        console.error("Error fetching wallet info:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletInfo();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!walletInfo) {
    return <div>No wallet information available.</div>;
  }

  return (
    <div>
      <h2>Wallet Information</h2>
      <ul>
        <li>
          <strong>App ID:</strong> {walletInfo.appId}
        </li>
        <li>
          <strong>User ID:</strong> {walletInfo.userId}
        </li>
        <li>
          <strong>User Token:</strong> {walletInfo.userToken}
        </li>
        <li>
          <strong>Encryption Key:</strong> {walletInfo.encryptionKey}
        </li>
        <li>
          <strong>Challenge ID:</strong> {walletInfo.challengeId}
        </li>
      </ul>
    </div>
  );
};

export default ShowInfo;
