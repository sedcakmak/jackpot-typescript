import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import styled from "styled-components";
import newWallet from "../assets/img/new_wallet.png";
import oldWallet from "../assets/img/old_wallet.png";
import polygonLogo from "../assets/img/polygon_logo.png";
import { checkBalance } from "../api/wallet";
import { handleCreateWallet, WalletInfo } from "../services/walletUtils";

const Logo = styled.img`
  height: 1.2rem;
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  margin-top: 1rem;
`;

const WalletContainer = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const WalletImage = styled.img`
  width: "100px";
  transition: transform 0.4s ease;
  &:hover {
    transform: scale(1.2);
  }
`;

const WalletModal: React.FC<{ show: boolean; onClose: () => void }> = ({
  show,
  onClose,
}) => {
  const [step, setStep] = useState<
    "initial" | "id" | "balance" | "createUCW" | "newWalletCreated"
  >("initial");
  const [ucwId, setUcwId] = useState<string>("");
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Loading state for loading spinner

  const handleIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const currentBalance = await checkBalance(ucwId);

      if (currentBalance === 0) {
        setError("Invalid wallet ID or no USDC balance.");
      } else if (currentBalance < 0.5) {
        setError(
          "Insufficient balance. Please deposit more funds using the faucet."
        );
      } else {
        setBalance(currentBalance);
        setError(null);
        setStep("balance");
      }
    } catch (err) {
      setError("Error checking balance.");
      console.error("Error checking balance:", err);
    }
  };

  const handleCreateNewWallet = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const createdWallet = await handleCreateWallet();
      if (createdWallet && createdWallet.userToken) {
        setWalletInfo(createdWallet);
        setStep("newWalletCreated");
      } else {
        throw new Error("Failed to create wallet.");
      }
    } catch (error) {
      setError("Failed to create wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    switch (step) {
      case "id":
        setStep("initial");
        break;
      case "balance":
        setStep("id");
        break;
      case "createUCW":
        setStep("initial");
        break;
      default:
        break;
    }
  };

  const handleClose = () => {
    setStep("initial");
    setUcwId("");
    setBalance(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  useEffect(() => {
    if (!show) {
      setStep("initial");
      setUcwId("");
      setBalance(null);
      setError(null);
      setLoading(false);
    }
  }, [show]);

  return (
    <Modal
      show={show}
      onHide={onClose}
    >
      <Modal.Header closeButton>
        <Modal.Title>Wallet Setup</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spinner
              animation="border"
              variant="info"
              role="status"
            />
            <p>Creating your wallet, please wait...</p>
          </div>
        )}
        {!loading && step === "initial" && (
          <div>
            <p>
              If you are new here, click to create a user-controlled wallet. If
              you already created and just want to check your balance, you need
              your <strong>Wallet Id</strong> to do that. The Piggybank also
              retrieves your wallet balance with your wallet address.
            </p>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <WalletContainer onClick={() => setStep("createUCW")}>
                <WalletImage
                  src={newWallet}
                  alt="create newWallet button"
                  title="Create new user-controlled wallet"
                />
                <p>I'm new around here!</p>
              </WalletContainer>
              <WalletContainer onClick={() => setStep("id")}>
                <WalletImage
                  src={oldWallet}
                  alt="link to wallet's balance check"
                  title="Check the balance of an already created wallet"
                />
                <p>Check the Wallet's Balance.</p>
              </WalletContainer>
            </div>
          </div>
        )}
        {!loading && step === "id" && (
          <Form onSubmit={handleIdSubmit}>
            <Form.Group controlId="ucwId">
              <Form.Label>
                Enter your Wallet ID to check your balance.
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Wallet Id"
                value={ucwId}
                onChange={(e) => setUcwId(e.target.value)}
              />
            </Form.Group>
            <ButtonWrapper>
              <Button
                variant="primary"
                type="submit"
              >
                Check Wallet
              </Button>
              {error && <div className="text-danger">{error}</div>}
              <Button
                variant="secondary"
                onClick={goBack}
              >
                Go Back
              </Button>
            </ButtonWrapper>
          </Form>
        )}
        {!loading && step === "balance" && (
          <div>
            <p>
              Your balance is {balance} USDC. Please deposit some into your
              piggy bank to start playing the game!
            </p>
            <ButtonWrapper>
              <Button
                variant="secondary"
                onClick={handleClose}
                style={{ marginTop: "10px" }}
              >
                Close
              </Button>
            </ButtonWrapper>
          </div>
        )}
        {!loading && step === "createUCW" && (
          <div>
            <p>
              By clicking the button below, you will be creating a
              user-controlled wallet. You will be asked to provide a{" "}
              <strong>PIN</strong>, followed by a recovery method. Memorize your{" "}
              <strong>PIN</strong>, since it is needed for depositing to the
              Piggybank.
            </p>
            <ButtonWrapper>
              <Button
                variant="primary"
                onClick={handleCreateNewWallet}
              >
                Create Wallet
              </Button>
              <Button
                variant="secondary"
                onClick={goBack}
              >
                Go Back
              </Button>
            </ButtonWrapper>
          </div>
        )}
        {!loading && step === "newWalletCreated" && walletInfo && (
          <div>
            <p>
              🎉 Congratulations! You've successfully created your
              user-controlled wallet! 🎉
            </p>
            <p>
              Please write down your <strong>wallet address</strong>, as it is
              necessary to fund your wallet, deposit Piggybank, and start
              playing the game.
            </p>
            <p>
              Your wallet address: <strong>{walletInfo.address}</strong>
            </p>
            <p>
              Your wallet Id is only important if you want to check your balance
              by clicking the wallet icon. For all other actions, your{" "}
              <strong>wallet address</strong> and your <strong>PIN</strong> will
              be enough.
            </p>
            <p>
              Your wallet Id: <strong>{walletInfo.id}</strong>
            </p>
            <p>
              Now, click the faucet below to get some USDC and get the game
              rolling! Make sure to select{" "}
              <Logo
                src={polygonLogo}
                alt="Polygon Logo"
              />
              <strong>Polygon PoS Amoy</strong> as your network!
            </p>
            <ButtonWrapper>
              <Button
                variant="primary"
                href="https://faucet.circle.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get USDC from Faucet
              </Button>

              <Button
                variant="secondary"
                onClick={handleClose}
              >
                Close
              </Button>
            </ButtonWrapper>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default WalletModal;
