import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import {
  Badge,
  Button,
  Modal,
  Form,
  InputGroup as BootstrapInputGroup,
} from "react-bootstrap";
import { XCircle } from "react-bootstrap-icons";
import piggybank from "../assets/img/piggybank.png";
import { checkBalance } from "../api/wallet";
import { db, collection, getDocs, query, where } from "../firebaseConfig";
import { transferUSDC } from "../services/api";
import { W3SSdk } from "@circle-fin/w3s-pw-web-sdk";

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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0.5rem;
`;

const BalanceInfo = styled.div`
  margin-top: 1rem;
  text-align: center;
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
  badgeValue: number;
}

const PiggybankContainer: React.FC<PiggybankContainerProps> = ({
  animate,
  badgeValue,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [sourceWalletAddress, setSourceWalletAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [showTransactionButton, setShowTransactionButton] =
    useState<boolean>(false);
  const [walletData, setWalletData] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState<string | null>(null);
  const [sdk, setSDK] = useState<W3SSdk | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceWalletAddress) {
      return setError("Please enter a wallet address.");
    }
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
      console.log("WALLET DATA FROM FIRESTORE", walletData);

      await fetchBalance(walletData.walletId);
      setShowTransactionButton(true);
    } catch (error) {
      console.error("Error making deposit:", error);
      setError("Failed to make deposit. Please try again.");
    }
  };

  const fetchBalance = async (walletId: string) => {
    try {
      const currentBalance = await checkBalance(walletId);
      setBalance(currentBalance);
      setModalMessage(
        currentBalance >= 0.5
          ? `You have ${currentBalance} USDC in your wallet. How much do you want to deposit?`
          : `You have ${currentBalance} USDC in your wallet. Please visit the faucet to deposit some USDC into your wallet.`
      );
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
    setShowTransactionButton(false);
    setModalMessage("");
    setWalletData(null);
  };

  const makeDeposit = async (walletData: any) => {
    //setShowModal(false);

    // Step 1: Check if the amount is not null, not equal to 0, and below the balance
    if (!amount || parseFloat(amount) === 0) {
      setError("Please enter a valid deposit amount greater than 0.");
      return;
    }

    if (balance !== null && parseFloat(amount) > balance) {
      setError("The deposit amount cannot exceed your wallet balance.");
      return;
    }

    console.log("makeDeposit called with walletData:", walletData);

    try {
      console.log("Attempting USDC transfer");

      const result = await transferUSDC(
        walletData.walletAddress
        //  amount,
        //  walletData.userToken
      );
      console.log("Transfer result:", result);

      if (result.status === "challenge_required" && sdk) {
        const encryptionKey = result.encryptionKey || walletData.encryptionKey;
        console.log("Using encryption key:", encryptionKey);

        if (!encryptionKey) {
          console.error("Missing encryption key");
          setError("Failed to initiate the challenge. Missing encryption key.");
          return;
        }
        sdk.setAuthentication({
          userToken: result.userToken,
          encryptionKey: result.encryptionKey,
        });

        sdk.execute(result.challengeId, (error, challengeResult) => {
          if (error) {
            console.error("Challenge execution error:", error);
            setError(`Failed to complete the challenge: ${error.message}`);
            return;
          }
          if (challengeResult) {
            console.log(`Challenge: ${challengeResult}`);

            switch (challengeResult.status.toLowerCase()) {
              case "complete":
                console.log("Deposit successful");
                // Handle successful deposit
                break;
              case "failed":
                console.error("Challenge failed:", challengeResult);
                setError("Failed to complete the challenge. Please try again.");
                break;
              case "expired":
                setError("The challenge has expired. Please try again.");
                break;
              case "in_progress":
                console.log("Challenge is still in progress");
                // You might want to implement a polling mechanism or provide user feedback
                break;
              case "pending":
                console.log("Challenge is pending");
                // Handle pending state
                break;
              default:
                console.log(
                  "Unknown challenge status:",
                  challengeResult.status
                );
            }
          }
        });
      } else {
        console.log("Deposit successful");
        // Handle successful deposit
      }
    } catch (error) {
      console.error("Error making deposit:", error);
      setError("Failed to make deposit. Please try again.");
    }
  };

  return (
    <Container>
      <PiggybankImage
        src={piggybank}
        alt="Piggybank"
        $animate={animate}
        onClick={displayPiggybankModal}
      />
      <h6>
        <Badge bg="primary">{badgeValue} USDC</Badge>
      </h6>
      <Modal
        show={showModal}
        onHide={handleCloseModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Piggybank</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <p>{modalMessage}</p>
          {walletData ? (
            <BalanceInfo>
              <Form.Group controlId="formAmount">
                <Form.Label>Amount to Deposit</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </Form.Group>
              <Button
                variant="success"
                style={{ marginTop: "10px" }}
                onClick={() => makeDeposit(walletData)}
              >
                Make Transaction
              </Button>
              <p>
                Balance: {balance !== null ? `${balance} USDC` : "Loading..."}
              </p>
            </BalanceInfo>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formWalletId">
                <Form.Label>
                  Enter the <strong>wallet address</strong> from which you'll be
                  sending the tokens:
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
              {showTransactionButton && (
                <>
                  <Form.Group controlId="formAmount">
                    <Form.Label>Amount to Deposit</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </Form.Group>
                  <Button
                    variant="success"
                    style={{ marginTop: "10px" }}
                    onClick={() => makeDeposit(walletData)}
                  >
                    Make Transaction
                  </Button>
                </>
              )}
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PiggybankContainer;
