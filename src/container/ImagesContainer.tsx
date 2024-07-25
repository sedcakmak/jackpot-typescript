import React, { useEffect, useState } from "react";
import { Container, Row, Col, Badge } from "react-bootstrap";
import styled, { keyframes, css } from "styled-components";
import wallet from "../assets/img/wallet.png";
import piggybank from "../assets/img/piggybank.png";
import faucet from "../assets/img/faucet.png";

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

const PiggybankContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 0.5rem;
`;

interface ImagesContainerProps {
  onWalletClick: () => void;
  badgeValue: number;
}

const ImagesContainer: React.FC<ImagesContainerProps> = ({
  onWalletClick,
  badgeValue,
}) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (badgeValue > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [badgeValue]);

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
              onClick={onWalletClick}
            />
            <PiggybankContainer>
              <PiggybankImage
                src={piggybank}
                alt="Piggybank"
                $animate={animate}
              />
              <h6>
                <Badge bg="primary">{badgeValue} USDC</Badge>
              </h6>
            </PiggybankContainer>
            <Image
              src={faucet}
              alt="Faucet"
              onClick={() =>
                window.open("https://faucet.circle.com/", "_blank")
              }
            />
          </div>
          <ClaimButton>Claim</ClaimButton>
        </Col>
      </Row>
    </Container>
  );
};

export default ImagesContainer;
