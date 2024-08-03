import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col } from "react-bootstrap";
import styled from "styled-components";
import wallet from "../assets/img/wallet.png";
import faucet from "../assets/img/faucet.png";
import PiggybankContainer from "./PiggybankContainer";
import { useWallet } from "../contexts/WalletContext";
import { claimUSDCService } from "../services/usdcClaimService";
import { updateFirestoreBalance } from "../services/firebaseService";

const Image = styled.img`
  height: 5rem;
  margin: 0 0.5rem;
  transition: transform 0.3s ease;
  &:hover {
    cursor: pointer;
    transform: scale(1.2);
  }
`;

const ClaimButton = styled.button`
  font-weight: 600;
  background-color: #ff9900;
  color: #ffffff;
  padding: 10px 20px;
  border: 2px solid #ffcc80;
  border-radius: 15px;
  font-size: 26px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.3);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;

  &:hover {
    background-color: #ffd900;
    color: black;
    box-shadow: 0px 10px 18px rgba(0, 0, 0, 0.5);
    transform: translateY(-1px);
    cursor: pointer;
  }

  &:active {
    transform: scale(0.95);
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
  }
  @media (max-width: 576px) {
    width: 100%;
  }
`;

interface ImagesContainerProps {
  onWalletClick: () => void;
}

const ImagesContainer: React.FC<ImagesContainerProps> = ({ onWalletClick }) => {
  const [animate, setAnimate] = useState(false);
  const { depositAmount, setDepositAmount, walletAddress } = useWallet();
  const prevDepositAmountRef = useRef(depositAmount);

  useEffect(() => {
    if (depositAmount > prevDepositAmountRef.current) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 1000);
      prevDepositAmountRef.current = depositAmount;
      return () => clearTimeout(timer);
    }
    prevDepositAmountRef.current = depositAmount;
  }, [depositAmount]);

  const handleClaim = async () => {
    if (walletAddress && depositAmount > 0) {
      try {
        const result = await claimUSDCService(walletAddress, depositAmount);

        // Update Firestore and local balance
        await updateFirestoreBalance(walletAddress, 0);
        setDepositAmount(0);
        alert("Claim successful! Your wallet's balance has been updated.");
      } catch (error) {
        console.error("Claim failed:", error);
        alert("Claim failed. Please try again.");
      }
    }
  };

  return (
    <Container fluid>
      <Row className="justify-content-center">
        <Col
          xs={12}
          className="d-flex flex-column align-items-center position-relative"
        >
          <div className="d-flex flex-wrap justify-content-center mb-3">
            <Image
              src={wallet}
              alt="Wallet"
              title="Create new wallet or check the balance"
              onClick={onWalletClick}
            />
            <PiggybankContainer animate={animate} />

            <Image
              src={faucet}
              alt="Faucet"
              title="Go to faucet to get some USDC tokens in your wallet"
              onClick={() =>
                window.open("https://faucet.circle.com/", "_blank")
              }
            />
          </div>
          <ClaimButton onClick={handleClaim}>Claim</ClaimButton>
        </Col>
      </Row>
    </Container>
  );
};

export default ImagesContainer;
