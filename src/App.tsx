import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import styled from "styled-components";
import SlotMachine from "./container/SlotMachine";
import Instructions from "./components/Instructions";
import ImagesContainer from "./container/ImagesContainer";
import WalletModal from "./components/WalletModal";
import ShowInfo from "./components/ShowInfo";

const Page = styled.div`
  text-align: center;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const InstructionsButton = styled.button`
  background-color: #3a3b3c;
  color: #f0e6d2;
  font-size: 1.2em;
  font-weight: bold;
  padding: 10px 20px;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.3);
  transform: skew(-10deg);
  transition: all 0.3s ease;

  &:hover {
    background-color: #28292a;
    box-shadow: 6px 6px 15px rgba(0, 0, 0, 0.5);
  }

  &:active {
    transform: skew(-10deg) scale(0.95);
  }
  @media (max-width: 576px) {
    width: 100%;
  }
`;

const Title = styled.h1`
  font-family: "Permanent Marker", cursive;
  font-size: 3.3rem;
  text-transform: uppercase;
  letter-spacing: 1rem;
  color: #ff9900;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  margin-bottom: 3rem;
`;

const App: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [badgeValue, setBadgeValue] = useState(1000.5);

  const handleClose = () => setShowInstructions(false);
  const handleShow = () => setShowInstructions(true);
  const handleWalletClose = () => setShowWalletModal(false);
  const handleWalletShow = () => setShowWalletModal(true);

  return (
    <Page>
      <Title>Quick Win</Title>
      <ShowInfo />
      <Container fluid>
        <Row>
          <Col
            xs={12}
            md={4}
            className="d-flex justify-content-center align-items-center"
          >
            <InstructionsButton onClick={handleShow}>
              Instructions
            </InstructionsButton>
          </Col>
          <Col
            xs={12}
            md={4}
            className="d-flex justify-content-center align-items-center my-3"
          >
            <SlotMachine
              badgeValue={badgeValue}
              setBadgeValue={setBadgeValue}
            />
          </Col>
          <Col
            xs={12}
            md={4}
            className="d-flex justify-content-center align-items-center"
          >
            <ImagesContainer
              onWalletClick={handleWalletShow}
              badgeValue={badgeValue}
            />
          </Col>
        </Row>
      </Container>
      <Instructions
        show={showInstructions}
        handleClose={handleClose}
      />
      <WalletModal
        show={showWalletModal}
        onClose={handleWalletClose}
      />
    </Page>
  );
};

export default App;
