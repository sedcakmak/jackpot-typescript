import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { checkBalance, getBalance } from "../api/wallet";
import newWallet from "../assets/img/new_wallet.png";
import oldWallet from "../assets/img/old_wallet.png";
import { handleCreateWallet } from "./CreateWallet";

const WalletModal: React.FC<{ show: boolean; onClose: () => void }> = ({
  show,
  onClose,
}) => {
  const [step, setStep] = useState<
    "initial" | "id" | "balance" | "createUCW" | "createAccount"
  >("initial");
  const [ucwId, setUcwId] = useState<string>("");
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Id submitted:", ucwId);
    try {
      const isValidId = await checkBalance(ucwId);
      console.log("Id validation result:", isValidId);
      if (isValidId) {
        const currentBalance = await getBalance(ucwId);
        console.log("Current balance:", currentBalance);
        setBalance(currentBalance);
        if (currentBalance >= 0.5) {
          console.log("Balance is sufficient, setting step to 'balance'");
          setStep("balance");
        }
      } else {
        setError("Invalid address or insufficient balance.");
        console.log("Error: Invalid address or insufficient balance.");
      }
    } catch (err) {
      setError("Error checking balance.");
      console.error("Error checking balance:", err);
    }
  };

  useEffect(() => {
    if (!show) {
      setStep("initial");
      setUcwId("");
      setBalance(null);
      setError(null);
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
                <p>Create New Circle Wallet</p>
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
                <p>Check the balance of an existing Circle Wallet</p>
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
              If you don't have a Circle account, please go{" "}
              <a
                href="https://console.circle.com/signup"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>{" "}
              and follow the instructions. Once your account is set up, click
              the button below to create your user-controlled wallet.
            </p>

            <Button
              variant="primary"
              onClick={handleCreateWallet}
            >
              Create Wallet
            </Button>
          </div>
        )}
        {step === "createAccount" && (
          <div>
            <p>
              You need a Circle account. Please create one{" "}
              <a
                href="https://circle.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>
              .
            </p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default WalletModal;
