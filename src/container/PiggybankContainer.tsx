import React, { useState } from "react";
import styled, { keyframes, css } from "styled-components";
import { Badge, Button, Modal, Form } from "react-bootstrap";
import piggybank from "../assets/img/piggybank.png";
import { checkBalance } from "../api/wallet";
import { db, collection, getDocs, query, where } from "../firebaseConfig";
import { transferUSDC } from "../services/transferUSDC";

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
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [showTransactionButton, setShowTransactionButton] =
    useState<boolean>(false);
  const [walletData, setWalletData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Step 1: Search Firestore for the Wallet Address
      const walletsRef = collection(db, "wallets");
      const q = query(walletsRef, where("walletAddress", "==", walletAddress));
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

      await makeDeposit(walletData);

      setShowTransactionButton(true);
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
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError(null);
    setWalletAddress("");
    setAmount("");
    setShowTransactionButton(false);
    setModalMessage("");
    setWalletData(null);
  };

  const makeDeposit = async (walletData: any) => {
    try {
      await transferUSDC(walletData.walletAddress, amount);
      console.log("Deposit successful");
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
              <p>Wallet ID: {walletData.walletId}</p>
              <p>Wallet Address: {walletData.walletAddress}</p>
              <p>
                User Token: <strong>{walletData.userToken}</strong>
              </p>
              <p>
                Challenge Id: <strong>{walletData.challengeId}</strong>
              </p>
              <p>
                Balance: {balance !== null ? `${balance} USDC` : "Loading..."}
              </p>
            </BalanceInfo>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formWalletId">
                <Form.Label>Wallet Address</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Wallet Address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                />
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
