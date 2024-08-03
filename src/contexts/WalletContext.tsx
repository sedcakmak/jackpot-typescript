import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import {
  updateFirestoreBalance,
  fetchFirestoreBalance,
} from "../services/firebaseService";
import { WalletInfo } from "../services/walletUtils";

interface WalletContextType {
  depositAmount: number;
  setDepositAmount: React.Dispatch<React.SetStateAction<number>>;
  updateBalance: (walletAddress: string, newBalance: number) => Promise<void>;
  walletInfo: WalletInfo | null;
  setWalletInfo: React.Dispatch<React.SetStateAction<WalletInfo | null>>;
  walletAddress: string;
  setWalletAddress: React.Dispatch<React.SetStateAction<string>>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>("");
  useEffect(() => {
    const fetchBalance = async () => {
      if (walletAddress) {
        try {
          const balance = await fetchFirestoreBalance(walletAddress);
          setDepositAmount(balance);
        } catch (error) {
          console.error("Failed to fetch balance from Firestore:", error);
        }
      }
    };

    fetchBalance();
  }, [walletAddress]);

  // Update Balance in Firestore
  const updateBalance = useCallback(
    async (walletAddress: string, newBalance: number) => {
      try {
        await updateFirestoreBalance(walletAddress, newBalance);
        setDepositAmount(newBalance);
      } catch (error) {
        console.error("Failed to update balance in Firestore", error);
      }
    },
    []
  );

  return (
    <WalletContext.Provider
      value={{
        depositAmount,
        setDepositAmount,
        updateBalance,
        walletInfo,
        setWalletInfo,
        walletAddress,
        setWalletAddress,
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
