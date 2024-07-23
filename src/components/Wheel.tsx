import React from "react";
import styled from "styled-components";

const Image = styled.img`
  width: 80px;
  height: 80px;
  border: 12px solid #eaeaea;
  border-radius: 16px;
  margin: 0 12px;
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
