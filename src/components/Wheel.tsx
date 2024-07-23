import React from "react";
import styled from "styled-components";

const Image = styled.img`
  width: 80px;
  height: 80px;
  border: 12px solid #eaeaea;
  padding: 10px;
  border-radius: 16px;
  margin: 0 16px;
  background-color: whitesmoke;
`;

const Wheel: React.FC<{ image: string }> = ({ image }) => (
  <Image
    src={image}
    alt={image}
    data-testid="wheel"
  />
);

export default Wheel;
