import React, { createContext, useState, useEffect, useContext } from "react";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { initializeApp, getApp, FirebaseApp } from "firebase/app";

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

// Firebase initialization
let app: FirebaseApp;
try {
  app = getApp();
} catch (error) {
  const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
  };
  app = initializeApp(firebaseConfig);
}

const db = getFirestore(app);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [newWalletInfo, setNewWalletInfo] = useState<NewWalletInfo | null>(
    null
  );
  useEffect(() => {
    console.log("WalletContext value changed:", newWalletInfo);
    if (newWalletInfo && newWalletInfo.userId) {
      const updateFirestore = async () => {
        try {
          const walletRef = doc(db, "wallets", newWalletInfo.userId);

          await updateDoc(walletRef, {
            walletAddress: newWalletInfo.address,
            walletId: newWalletInfo.id,
          });

          console.log("Firestore updated successfully");
        } catch (error) {
          console.error("Error updating Firestore:", error);
        }
      };

      updateFirestore();
    }
  }, [newWalletInfo]);

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
