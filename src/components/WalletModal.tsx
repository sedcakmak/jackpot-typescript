import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import styled from "styled-components";
import newWallet from "../assets/img/new_wallet.png";
import oldWallet from "../assets/img/old_wallet.png";
import polygonLogo from "../assets/img/polygon_logo.png";
import { checkBalance } from "../api/wallet";
import { handleCreateWallet } from "./CreateWallet";

const Logo = styled.img`
  height: 1.2rem;
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
  const [newWalletInfo, setNewWalletInfo] = useState<{
    address: string;
    id: string;
  } | null>(null);

  const handleIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("Submitting wallet ID:", ucwId);
      const currentBalance = await checkBalance(ucwId);
      console.log("Retrieved balance:", currentBalance);

      if (currentBalance === 0) {
        setError("Invalid wallet ID or no USDC balance.");
        console.log("Error: Invalid wallet ID or no USDC balance.");
      } else if (currentBalance < 0.5) {
        setError(
          "Insufficient balance. Please deposit more funds using the faucet."
        );
        console.log("Error: Insufficient balance.");
      } else {
        setBalance(currentBalance);
        setError(null);
        console.log("Balance is sufficient, setting step to 'balance'");
        setStep("balance");
      }
    } catch (err) {
      setError("Error checking balance.");
      console.error("Error checking balance:", err);
    }
  };

  const handleCreateNewWallet = async () => {
    try {
      const walletInfo = await handleCreateWallet();
      if (walletInfo) {
        console.log("New wallet created:", walletInfo);
        setNewWalletInfo({
          address: walletInfo.address,
          id: walletInfo.id,
        });
        setStep("newWalletCreated");
      }
    } catch (error) {
      console.error("Failed to create wallet:", error);
      setError("Failed to create wallet. Please try again.");
    }
  };

  useEffect(() => {
    if (!show) {
      setStep("initial");
      setUcwId("");
      setBalance(null);
      setError(null);
      setNewWalletInfo(null);
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
        {step === "initial" && (
          <div>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <div
                onClick={() => setStep("createUCW")}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={newWallet}
                  alt="Create New Circle Wallet"
                  style={{ width: "100px" }}
                />
                <p>I'm new around here!</p>
              </div>
              <div
                onClick={() => setStep("id")}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={oldWallet}
                  alt="Check the balance of an existing Circle Wallet"
                  style={{ width: "100px" }}
                />
                <p>I already have a wallet.</p>
              </div>
            </div>
          </div>
        )}
        {step === "id" && (
          <Form onSubmit={handleIdSubmit}>
            <Form.Group controlId="ucwId">
              <Form.Label>Enter your Wallet Id please.</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Wallet Id"
                value={ucwId}
                onChange={(e) => setUcwId(e.target.value)}
              />
            </Form.Group>
            <Button
              variant="primary"
              type="submit"
            >
              Check Wallet
            </Button>
            {error && <div className="text-danger">{error}</div>}
          </Form>
        )}
        {step === "balance" && (
          <div>
            <p>
              Your balance is {balance} USDC. Please deposit some into your
              piggy bank to start playing the game!
            </p>
          </div>
        )}
        {step === "createUCW" && (
          <div>
            <p>
              By clicking the button below, you will be creating a
              user-controlled wallet. You will be asked to provide a PIN,
              followed by a recovery method.{" "}
            </p>

            <Button
              variant="primary"
              onClick={handleCreateNewWallet}
            >
              Create Wallet
            </Button>
          </div>
        )}
        {step === "newWalletCreated" && newWalletInfo && (
          <div>
            <p>
              🎉 Congratulations! You've successfully created your
              user-controlled wallet! 🎉
            </p>
            <p>
              Please write down your wallet address, as it is necessary to fund
              your wallet, make transactions, and start playing the game.
            </p>
            <p>
              Your wallet address: <strong>{newWalletInfo.address}</strong>
            </p>
            <p>
              Wallet ID: <strong>{newWalletInfo.id}</strong>
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
            <Button
              variant="primary"
              href="https://faucet.circle.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get USDC from Faucet
            </Button>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default WalletModal;
