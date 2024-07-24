import React from "react";
import { Offcanvas } from "react-bootstrap";
import styled from "styled-components";

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
        First things first, click the wallet icon to either connect your Circle
        wallet or create a new one. It's super easy! Please note that this game
        is running on TestNet, so you'll be using virtual currencies for now.
        Real cryptocurrencies might be added in the future!
        <br />
        <br />
        Once you're all set up, deposit some USDC into the piggy bank from your
        wallet. This will let you join the fun!
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
        If you want to withdraw any leftover funds, just hit the{" "}
        <strong>Claim</strong> button. It's that simple!
        <br />
        <br />
        Feel free to spin as many times as you like, and may the odds be ever in
        your favor! 🌟
      </Text>
    </StyledOffcanvasBody>
  </Offcanvas>
);

export default Instructions;