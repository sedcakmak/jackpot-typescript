import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { Badge, Button, Modal, Form } from "react-bootstrap";
import piggybank from "../assets/img/piggybank.png";
import { checkBalance } from "../api/wallet";
import axios from "axios";
import { useWallet } from "../contexts/WalletContext";
import { firestore } from "../firebaseConfig"; // Assuming you have configured Firestore

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
  const { newWalletInfo, setNewWalletInfo } = useWallet();
  const [walletId, setWalletId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Step 1: Search Firestore for the Wallet ID
      const walletsRef = firestore.collection("wallets");
      const querySnapshot = await walletsRef
        .where("walletId", "==", walletId)
        .get();

      if (querySnapshot.empty) {
        setError("No matching wallet found in the database.");
        return;
      }

      // Assuming there's only one matching document
      const walletDoc = querySnapshot.docs[0];
      const walletData = walletDoc.data();
      console.log("WALLET DATA FROM FIRESTORE" + walletData, walletDoc);
      // const { userToken, userId, destinationAddress, tokenId } = walletData;

      console.log("Wallet Data from Firestore:", walletData);

      // Step 2: Initiate the transaction
      // const options = {
      //   method: "POST",
      //   url: "https://api.circle.com/v1/w3s/user/transactions/transfer",
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer <YOUR_API_KEY>`,
      //     "X-User-Token": userToken,
      //   },
      //   data: {
      //     idempotencyKey: "<UNIQUE_UUID>", // Generate a unique UUID for this transaction
      //     userId: userId,
      //     destinationAddress: destinationAddress,
      //     refId: "Deposit",
      //     amounts: [amount],
      //     feeLevel: "HIGH",
      //     tokenId: tokenId,
      //     walletId: walletId,
      //   },
      // };

      // const response = await axios.request(options);
      // console.log("Deposit successful:", response.data);

      // setShowModal(false); // Close the modal on successful transaction
    } catch (error) {
      console.error("Error making deposit:", error);
      setError("Failed to make deposit. Please try again.");
    }
  };

  useEffect(() => {
    console.log("PiggybankContainer useEffect triggered");
    console.log("newWalletInfo in PiggybankContainer:", newWalletInfo);

    const fetchBalance = async () => {
      if (newWalletInfo) {
        try {
          const currentBalance = await checkBalance(newWalletInfo.id);
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
      } else {
        console.log("No wallet info available, cannot fetch balance");
      }
    };

    fetchBalance();
  }, [newWalletInfo]);

  const displayPiggybankModal = async () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError(null);
  };

  const makeDeposit = async () => {
    try {
      console.log("makeDeposit working");
      // Fetch wallet info from your backend
      const walletInfoResponse = await axios.get("/api/wallet-info", {
        headers: {
          Authorization: `Bearer ${newWalletInfo?.userToken}`, // Provide the necessary authorization header
        },
      });

      const { userToken, id: walletId, userId } = walletInfoResponse.data;

      const amount = 1; // Define the amount to be transferred

      // Make the deposit request
      const response = await axios.post("/api/transfer-usdc", {
        userToken,
        walletId,
        amount,
        userId,
      });

      console.log("Deposit successful:", response.data);
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
          {newWalletInfo ? (
            <BalanceInfo>
              <p>Wallet ID: {newWalletInfo.id}</p>
              <p>Wallet Address: {newWalletInfo.address}</p>
              <p>
                User Token: <strong>{newWalletInfo.userToken}</strong>
              </p>
              <p>
                Challenge Id: <strong>{newWalletInfo.challengeId}</strong>
              </p>
              <p>
                Balance: {balance !== null ? `${balance} USDC` : "Loading..."}
              </p>
            </BalanceInfo>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formWalletId">
                <Form.Label>Wallet ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Wallet ID"
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                />
              </Form.Group>
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
                variant="primary"
                type="submit"
                style={{ marginTop: "10px" }}
              >
                Submit
              </Button>
            </Form>
          )}
          <Button
            variant="primary"
            onClick={makeDeposit}
            disabled={!newWalletInfo}
          >
            Make Deposit
          </Button>
          <Button
            variant="secondary"
            onClick={handleCloseModal}
            style={{ marginLeft: "0.5rem" }}
          >
            Close
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PiggybankContainer;
