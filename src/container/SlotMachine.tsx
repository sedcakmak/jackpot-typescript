import React, { useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import Confetti from "react-confetti";

import Spinner from "./Spinner";
import Sound from "../components/Sound";
import piggybank from "../assets/img/piggybank.png";
import ppiggybank from "../assets/img/ppiggybank.png";
import wallet from "../assets/img/wallet.png";
import shop from "../assets/img/shop.png";
import { ReactComponent as USDCSvg } from "../assets/img/svg/usdc.svg";

const scaleUpDown = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
`;

const Title = styled.h1`
  font-family: "Permanent Marker", cursive;
  font-size: 50px;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: #ff9900;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const Buttons = styled.div`
  margin: 10px auto;
`;

const Button = styled.button`
  font-family: "Montserrat", sans-serif;
  font-weight: 600;
  background-color: #4caf50;
  color: #ffffff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 26px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background-color: #45a049;
    cursor: pointer;
  }
  &:active {
    transform: scale(0.95);
  }
  &:disabled {
    background-color: #808080;
    cursor: not-allowed;
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
`;

const ImageWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  padding: 40px;
  transition: all 3 ease;
`;
const Image = styled.img`
  &:hover {
    cursor: pointer;
    transform: scale(1.2);
  }
`;
const ShopImage = styled(Image)`
  height: 100px;
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 80px;
`;

const Winner = styled.div`
  margin: 20px auto;
  font-size: 25px;
  color: green;
  animation: ${scaleUpDown} 0.6s ease;
`;

const Loser = styled.div`
  margin: 20px auto;
  font-size: 25px;
  color: red;
  animation: ${scaleUpDown} 0.6s ease;
`;

//const PARTICIPATION_FEE = 0.5;
const MAX_PRIZE = 100;
const CONSEC_PRIZE = 10;
const NON_CONSEC_PRIZE = 1;

const SlotMachine: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const [prize, setPrize] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const hasSpun = useRef(false);

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

  const handleStart = () => {
    setIsRunning(true);
    setResult(null);
    setPrize(0);
    hasSpun.current = true;
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleResult = (wheels: string[]) => {
    if (!hasSpun.current) return;

    const images = wheels.map((wheel) => wheel.split("/").pop());
    const uniqueImages = [...new Set(images)];

    if (uniqueImages.length === 3) {
      setResult("lose");
      setPrize(0);
    } else if (uniqueImages.length === 1) {
      setResult("win");
      setPrize(MAX_PRIZE);
    } else if (images[0] === images[1] || images[1] === images[2]) {
      setResult("win");
      setPrize(CONSEC_PRIZE);
    } else {
      setResult("win");
      setPrize(NON_CONSEC_PRIZE);
    }
  };

  return (
    <React.Fragment>
      <Title>Quick Win</Title>
      <ImageWrapper>
        <Image
          src={wallet}
          alt="Wallet"
          as="img"
        />
        <Image
          src={piggybank}
          alt="piggybank"
          as="img"
        />
        <Image
          src={ppiggybank}
          alt="piggybank"
          as="img"
        />
      </ImageWrapper>
      <ShopImage
        src={shop}
        alt="marketplace"
        as="img"
      />
      <Spinner
        spin={isRunning}
        onStop={handleResult}
      />
      <Buttons>
        <Button
          onClick={handleStart}
          disabled={isRunning}
        >
          Spin
        </Button>
      </Buttons>
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
              {prize}.00
            </Winner>
          </>
        )}
        {result === "lose" && hasSpun.current && (
          <>
            <Loser>You lose!</Loser>
            <Sound audio="fail" />
          </>
        )}
      </ResultText>
    </React.Fragment>
  );
};

export default SlotMachine;
