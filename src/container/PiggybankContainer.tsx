import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import {
  Badge,
  Button,
  Modal,
  Form,
  Spinner,
  InputGroup as BootstrapInputGroup,
} from "react-bootstrap";
import { XCircle } from "react-bootstrap-icons";
import piggybank from "../assets/img/piggybank.png";
import { checkBalance } from "../api/wallet";

import { transferUSDC } from "../services/api";
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";
import { useWallet } from "../contexts/WalletContext";
import { db, collection, getDocs, query, where } from "../firebaseConfig";
import { fetchFirestoreBalance } from "../services/firebaseService";

const wiggle = keyframes`
  0% { transform: rotate(-1deg); }
  50% { transform: rotate(1deg); }
  100% { transform: rotate(-1deg); }
`;

const PiggybankImage = styled.img<{ $animate: boolean }>`
  height: 5rem;
  margin: 0 0.5rem;
  transition: transform 0.3s ease;
  ${({ $animate }) =>
    $animate
      ? css`
          animation: ${wiggle} 1s ease;
        `
      : css`
          animation: none;
        `}
  &:hover {
    cursor: pointer;
    transform: scale(1.2);
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  margin-top: 1rem;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0.5rem;
`;

const BalanceInfo = styled.div`
  margin-top: 1rem;
  // text-align: center;
`;

const StyledInputGroup = styled(BootstrapInputGroup)`
  position: relative;
`;
const ClearButton = styled.button`
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  color: #6c757d;
  cursor: pointer;
  z-index: 10;

  &:hover {
    color: #dc3545;
  }
`;

interface PiggybankContainerProps {
  animate: boolean;
}

const PiggybankContainer: React.FC<PiggybankContainerProps> = ({ animate }) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [sourceWalletAddress, setSourceWalletAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [walletData, setWalletData] = useState<any>(null);
  const [sdk, setSDK] = useState<W3SSdk | null>(null);
  const { setWalletAddress } = useWallet();
  const { depositAmount, setDepositAmount, updateBalance } = useWallet();
  const [loading, setLoading] = useState<boolean>(false); // Loading state for loading spinner

  const depositAmountRef = useRef(depositAmount);

  const handleClearInput = () => {
    setSourceWalletAddress("");
  };
  useEffect(() => {
    const initSDK = new W3SSdk({
      appSettings: {
        appId: process.env.REACT_APP_APP_ID as string,
      },
    });
    setSDK(initSDK);
  }, []);

  useEffect(() => {
    depositAmountRef.current = depositAmount;
  }, [depositAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceWalletAddress) {
      return setError("Please enter a wallet address.");
    }
    setWalletAddress(sourceWalletAddress);
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      // Step 1: Search Firestore for the Wallet Address
      const walletsRef = collection(db, "wallets");
      const q = query(
        walletsRef,
        where("walletAddress", "==", sourceWalletAddress)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("No matching wallet found in the database.");
        return;
      }
      // Assuming there's only one matching document
      const walletDoc = querySnapshot.docs[0];
      const walletData = walletDoc.data();
      setWalletData(walletData);

      await fetchBalance(walletData.walletId);
    } catch (error) {
      console.error("Error making deposit:", error);
      setError("Failed to make deposit. Please try again.");
    }
  };

  const fetchBalance = async (walletId: string) => {
    try {
      const currentBalance = await checkBalance(walletId);
      setBalance(currentBalance);

      if (currentBalance === 0 && depositAmountRef.current > 0.5) {
        setModalMessage(
          `You have ${currentBalance} USDC in your wallet and ${depositAmountRef.current} USDC in your piggyBank. You can close this modal and play.`
        );
      } else if (currentBalance >= 0.5) {
        setModalMessage(
          `You have ${currentBalance} USDC in your wallet. How much do you want to deposit?`
        );
      } else {
        setModalMessage(
          `You have ${currentBalance} USDC in your wallet. Please visit the faucet to deposit some USDC into your wallet.`
        );
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
      setError("Error fetching balance. Please try again.");
    }
  };

  const displayPiggybankModal = () => {
    setShowModal(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError(null);
    setSourceWalletAddress("");
    setAmount("");
    setModalMessage("");
    setWalletData(null);
  };

  const makeDeposit = async (walletData: any) => {
    setLoading(true);

    // Step 1: Check if the amount is not null, not equal to 0, and below the balance
    if (!amount || parseFloat(amount) === 0) {
      setError("Please enter a valid deposit amount greater than 0.");
      setLoading(false);
      return;
    }

    if (balance !== null && parseFloat(amount) > balance) {
      setError("The deposit amount cannot exceed your wallet balance.");
      setLoading(false);
      return;
    }

    try {
      // Depositing to Piggybank AKA transaction to dev-controlled wallet
      const result = await transferUSDC(walletData.walletAddress, amount);

      if (result.status !== "challenge_required") {
        throw new Error("Expected a challenge, but none was required.");
      }

      if (!sdk) {
        throw new Error("SDK is not initialized.");
      }

      if (result.status === "challenge_required" && sdk) {
        const encryptionKey = result.encryptionKey || walletData.encryptionKey;

        if (!encryptionKey) {
          console.error("Missing encryption key");
          setError("Failed to initiate the challenge. Missing encryption key.");
          setLoading(false);
          return;
        }
        sdk.setAuthentication({
          userToken: result.userToken,
          encryptionKey: result.encryptionKey,
        });

        sdk.execute(result.challengeId, async (error, challengeResult) => {
          setLoading(false);
          if (error) {
            console.error("Challenge execution error:", error);
            setError(`Failed to complete the challenge: ${error.message}`);
            return;
          }
          if (challengeResult) {
            switch (challengeResult.status.toLowerCase()) {
              case "complete":
                const depositAmountNumber = parseFloat(amount);
                alert("Deposit successful!");

                // Fetch the current balance from Firestore
                const currentFirestoreBalance = await fetchFirestoreBalance(
                  walletData.walletAddress
                );

                // Calculate the new balance
                const newBalance =
                  currentFirestoreBalance + depositAmountNumber;

                try {
                  // Update local state
                  setDepositAmount(
                    (prevAmount) => prevAmount + depositAmountNumber
                  );

                  // Update Firestore
                  await updateBalance(walletData.walletAddress, newBalance);
                  setBalance(newBalance);
                } catch (error) {
                  console.error("Error updating Firestore balance:", error);
                  setError(
                    "Failed to update balance. Please check your balance and try again if needed."
                  );
                }

                break;

              case "failed":
                console.error("Challenge failed:", challengeResult);
                setError("Failed to complete the challenge. Please try again.");
                break;
              case "expired":
                setError("The challenge has expired. Please try again.");
                break;
              case "in_progress":
                break;
              case "pending":
                break;
              default:
                setError("Unexpected challenge status. Please try again.");
            }
          }
        });
      }
    } catch (error) {
      console.error("Error making deposit:", error);
      setError("Failed to make deposit. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Container>
      <PiggybankImage
        src={piggybank}
        alt="Piggybank"
        title="Deposit to the Piggybank from your wallet"
        $animate={animate}
        onClick={displayPiggybankModal}
      />
      <h6>
        <Badge bg="primary">{depositAmount} USDC</Badge>
      </h6>
      <Modal
        show={showModal || loading}
        onHide={handleCloseModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Piggybank</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spinner
                animation="border"
                variant="info"
                role="status"
              />
              <p>
                Depositing your funds into the Piggybank, please hold tight!
              </p>
            </div>
          ) : (
            <>
              {error && <p style={{ color: "red" }}>{error}</p>}
              <p>{modalMessage}</p>
              {walletData ? (
                <BalanceInfo>
                  <Form.Group controlId="formAmount">
                    <Form.Label>
                      <strong>Amount to Deposit:</strong>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </Form.Group>
                  <ButtonWrapper>
                    <Button
                      variant="success"
                      onClick={() => makeDeposit(walletData)}
                    >
                      Make Transaction
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleCloseModal}
                    >
                      Close
                    </Button>
                  </ButtonWrapper>
                </BalanceInfo>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="formWalletId">
                    <Form.Label>
                      Enter the <strong>wallet address</strong> from which
                      you'll be sending the tokens:
                    </Form.Label>
                    <StyledInputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Enter Wallet Address"
                        value={sourceWalletAddress}
                        onChange={(e) => setSourceWalletAddress(e.target.value)}
                      />
                      <ClearButton onClick={handleClearInput}>
                        <XCircle />
                      </ClearButton>
                    </StyledInputGroup>
                    <Button
                      variant="primary"
                      type="submit"
                      style={{ marginTop: "10px" }}
                    >
                      Submit
                    </Button>
                  </Form.Group>
                </Form>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PiggybankContainer;
