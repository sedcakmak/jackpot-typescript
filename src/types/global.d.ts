declare global {
  interface Window {
    circle: {
      initializeUser: (params: {
        appId: string;
        userToken: string;
        encryptionKey: string;
        challengeId: string;
        onSuccess: () => void;
        onError: (error: any) => void;
      }) => void;
    };
  }
}

export {};
