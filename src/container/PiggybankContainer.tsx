import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { Badge, Button, Modal } from "react-bootstrap";
import piggybank from "../assets/img/piggybank.png";
import { checkBalance } from "../api/wallet";
import axios from "axios";
import { useWallet } from "../contexts/WalletContext";

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

  useEffect(() => {
    console.log("PiggybankContainer useEffect triggered");
    console.log("newWalletInfo in PiggybankContainer:", newWalletInfo);

    const fetchBalance = async () => {
      if (newWalletInfo) {
        try {
          console.log("Fetching balance for wallet:", newWalletInfo.id);
          const currentBalance = await checkBalance(newWalletInfo.id);
          console.log("Fetched balance:", currentBalance);
          setBalance(currentBalance);
          setModalMessage(`Your current balance is ${currentBalance} USDC.`);
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
            <p>Wallet information not available. newWalletInfo is null</p>
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
