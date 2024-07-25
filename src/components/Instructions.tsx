import React from "react";
import { Offcanvas } from "react-bootstrap";
import styled from "styled-components";
import polygonLogo from "../assets/img/polygon_logo.png";
import circleLogo from "../assets/img/circle_logo.jpg";

const StyledOffcanvasBody = styled(Offcanvas.Body)`
  background-color: #f9f9f9;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
`;

const Text = styled.p`
  font-size: 1rem;
  color: #555;
  line-height: 1.6;
`;

const Logo = styled.img`
  height: 1.2rem;
`;

interface InstructionsProps {
  show: boolean;
  handleClose: () => void;
}

const Instructions: React.FC<InstructionsProps> = ({ show, handleClose }) => (
  <Offcanvas
    show={show}
    onHide={handleClose}
    placement="start"
  >
    <Offcanvas.Header closeButton>
      <Title>Welcome to Quick Win!</Title>
    </Offcanvas.Header>
    <StyledOffcanvasBody>
      <Text>
        Hey there!🎉 Ready to try your luck? Let's get started!
        <br />
        <br />
        First things first, click the wallet icon to either create a new{" "}
        <Logo
          src={circleLogo}
          alt="Circle Logo"
        />
        <strong>Circle </strong> USDC wallet or check the balance of your
        existing one. It’s super easy! Please note that, for now, you’ll be
        using Testnet USDC in this game.
        <br />
        <br />
        Once you're all set up, click on the piggy bank to deposit some USDC
        from your wallet. This will let you join the fun!
        <br />
        <br />
        If you don't have enough deposits, click on the faucet to visit Circle's
        Testnet Faucet. Make sure the USDC option is chosen and select{" "}
        <Logo
          src={polygonLogo}
          alt="Polygon Logo"
        />
        <strong>Polygon PoS Amoy</strong> as your network.
        <br />
        <br />
        Each spin costs just <strong>0.5 USDC</strong>. Here's what you could
        win:
        <br />
        <br />
        <strong>Two-of-a-Kind Prize (1 USDC):</strong> Two matching images, not
        next to each other.
        <br />
        <strong>Close Call Prize (10 USDC):</strong> Two matching images that
        are next to each other.
        <br />
        <strong>Grand Prize (100 USDC):</strong> All three images match!
        <br />
        <br />
        If you want to withdraw any leftover funds, just hit the
        <strong> Claim</strong> button. It's that simple!
        <br />
        <br />
        Feel free to spin as many times as you like, and may the odds be ever in
        your favor! 🌟
      </Text>
    </StyledOffcanvasBody>
  </Offcanvas>
);

export default Instructions;
