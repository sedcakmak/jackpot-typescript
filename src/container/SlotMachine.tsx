import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import Confetti from "react-confetti";
import { Container, Row, Col, Modal, Button } from "react-bootstrap";
import { ReactComponent as USDCSvg } from "../assets/img/svg/usdc.svg";
import Spinner from "./Spinner";
import Sound from "../components/Sound";
import { useWallet } from "../contexts/WalletContext";
import { WalletInfo } from "../services/walletUtils";

const scaleUpDown = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

const ButtonWrapper = styled.div`
  margin: 10px auto;
  width: 100%;
`;

const SpinButton = styled.button`
  font-weight: 600;
  background-color: #4caf50;
  color: #ffffff;
  padding: 10px 20px;
  border: none;
  border-radius: 15px;
  font-size: 26px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.3);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;

  &:hover {
    background-color: #45a049;
    box-shadow: 0px 10px 18px rgba(0, 0, 0, 0.5);
    cursor: pointer;
  }

  &:active {
    transform: scale(0.95);
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    background-color: #808080;
    cursor: not-allowed;
    box-shadow: none;
    text-shadow: none;
  }
  @media (max-width: 576px) {
    width: 100%;
  }
`;

const StyledUSDCSvg = styled(USDCSvg)`
  width: 1em;
  height: 1em;
  vertical-align: middle;
`;

const ResultText = styled.div`
  color: #d32f2f;
  font-weight: bold;
  margin: 20px 0;
  min-height: 80px;
`;

const Winner = styled.div`
  font-size: 25px;
  color: green;
  animation: ${scaleUpDown} 0.6s ease;
`;

const Loser = styled.div`
  font-size: 25px;
  color: red;
  animation: ${scaleUpDown} 0.6s ease;
`;

const MAX_PRIZE = 5;
const CONSEC_PRIZE = 1;
const NON_CONSEC_PRIZE = 0.25;
const ENTRANCE_FEE = 0.5;

const SlotMachine: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const [prize, setPrize] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const hasSpun = useRef(false);

  const { depositAmount, setDepositAmount, updateBalance, walletAddress } =
    useWallet();

  useEffect(() => {
    if (isRunning) {
      const stop = setTimeout(() => {
        handleStop();
      }, 2000);
      return () => clearTimeout(stop);
    }
  }, [isRunning]);

  useEffect(() => {
    if (result === "win" && prize === MAX_PRIZE) {
      setShowConfetti(true);
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 7500);
      return () => clearTimeout(confettiTimer);
    }
  }, [result, prize]);

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleStart = async () => {
    if (depositAmount < ENTRANCE_FEE) {
      setShowBadgeModal(true);
      return;
    }

    try {
      const newBalance = depositAmount - ENTRANCE_FEE;
      if (walletAddress) {
        await updateBalance(walletAddress, newBalance);
      }

      setDepositAmount(newBalance);
      setIsRunning(true);
      setResult(null);
      setPrize(0);
      hasSpun.current = true;
    } catch (error) {
      console.error("Error updating balance:", error);
      // Handle the error appropriately, maybe show an error message to the user
    }
  };

  const handleResult = async (wheels: string[]) => {
    if (!hasSpun.current) return;

    const images = wheels.map((wheel) => wheel.split("/").pop());
    const uniqueImages = [...new Set(images)];

    let newPrize = 0;
    if (uniqueImages.length === 3) {
      setResult("lose");
      newPrize = 0;
    } else if (uniqueImages.length === 1) {
      setResult("win");
      newPrize = MAX_PRIZE;
    } else if (images[0] === images[1] || images[1] === images[2]) {
      setResult("win");
      newPrize = CONSEC_PRIZE;
    } else {
      setResult("win");
      newPrize = NON_CONSEC_PRIZE;
    }

    setPrize(newPrize);

    try {
      const updatedBalance = depositAmount + newPrize;

      if (walletAddress) {
        await updateBalance(walletAddress, updatedBalance);
      }

      setDepositAmount(updatedBalance);
    } catch (error) {
      console.error("Error updating balance:", error);
      // Handle the error appropriately, maybe show an error message to the user
    }
  };

  const handleModalClose = () => setShowBadgeModal(false);

  return (
    <Container
      fluid="md"
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Row>
        <Col></Col>
      </Row>

      <Spinner
        spin={isRunning}
        onStop={handleResult}
      />
      <ButtonWrapper>
        <SpinButton
          onClick={handleStart}
          disabled={isRunning}
        >
          Spin
        </SpinButton>
      </ButtonWrapper>
      <ResultText>
        {result === "win" && hasSpun.current && (
          <>
            {prize === MAX_PRIZE && showConfetti && (
              <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
              />
            )}
            <Sound audio={prize === MAX_PRIZE ? "slotmachine" : "coin"} />
            <Winner>
              You win! Your prize: <StyledUSDCSvg />
              {prize}
            </Winner>
          </>
        )}
        {result === "lose" && hasSpun.current && (
          <>
            <Loser>Better luck next time!</Loser>
            <Sound audio="fail" />
          </>
        )}
      </ResultText>

      <Modal
        show={showBadgeModal}
        onHide={handleModalClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Insufficient Credits</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Not enough credits. Please deposit USDC to your piggy bank. You need
          at least 0.5 USDC to play.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleModalClose}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SlotMachine;
