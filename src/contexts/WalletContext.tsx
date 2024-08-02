import React, { createContext, useState, useEffect, useContext } from "react";

interface NewWalletInfo {
  address: string;
  id: string;
  userToken: string;
  challengeId: string;
  userId: string;
}

interface WalletContextType {
  newWalletInfo: NewWalletInfo | null;
  setNewWalletInfo: React.Dispatch<React.SetStateAction<NewWalletInfo | null>>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [newWalletInfo, setNewWalletInfo] = useState<NewWalletInfo | null>(
    null
  );

  return (
    <WalletContext.Provider value={{ newWalletInfo, setNewWalletInfo }}>
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
