import React, { createContext, useState, useEffect, useContext } from "react";
import {
  updateFirestoreBalance,
  fetchFirestoreBalance,
} from "../services/firebaseService";
import { handleCreateWallet, WalletInfo } from "../services/walletUtils";

interface WalletContextType {
  depositAmount: number;
  setDepositAmount: React.Dispatch<React.SetStateAction<number>>;
  updateBalance: (walletAddress: string, newBalance: number) => Promise<void>;
  walletInfo: WalletInfo | null;
  setWalletInfo: React.Dispatch<React.SetStateAction<WalletInfo | null>>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);

  useEffect(() => {
    const fetchBalance = async (walletAddress: string) => {
      try {
        const balance = await fetchFirestoreBalance(walletAddress);
        setDepositAmount(balance);
      } catch (error) {
        console.error("Failed to fetch balance from Firestore:", error);
      }
    };

    if (walletInfo?.address) {
      fetchBalance(walletInfo.address);
    }
  }, [walletInfo]);

  // Update Balance in Firestore
  const updateBalance = async (walletAddress: string, newBalance: number) => {
    try {
      await updateFirestoreBalance(walletAddress, newBalance);
      setDepositAmount(newBalance);
    } catch (error) {
      console.error("Failed to update balance in Firestore", error);
      // You might want to handle this error, perhaps by setting an error state
    }
  };

  return (
    <WalletContext.Provider
      value={{
        depositAmount,
        setDepositAmount,
        updateBalance,
        walletInfo,
        setWalletInfo,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
