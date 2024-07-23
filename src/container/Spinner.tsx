import React, { useState, useEffect, useRef } from "react";
import Wheel from "../components/Wheel";
import styled from "styled-components";

import strawberry from "../assets/img/strawberry.png";
import banana from "../assets/img/banana.png";
import orange from "../assets/img/orange.png";
import monkey from "../assets/img/monkey.png";
import cherry from "../assets/img/cherry.png";
import bell from "../assets/img/bell.png";
import seven from "../assets/img/seven.png";

const Wrapper = styled.div`
  // background-color: #1e1e2e;
  background-color: #3a3a6d;
  padding: 10px;
  border-radius: 16px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
`;

interface SpinnerProps {
  spin: boolean;
  onStop: (wheels: string[]) => void;
}

const Spinner: React.FC<SpinnerProps> = ({ spin, onStop }) => {
  const [spinning, setSpinning] = useState(false);
  const [wheels, setWheels] = useState<string[]>([]);
  const isSpinning = useRef<NodeJS.Timeout | null>(null);

  const images = [cherry, bell, seven];
  // const images = [strawberry, banana, orange, monkey, cherry, bell, seven];

  useEffect(() => {
    setWheels([randomImage(), randomImage(), randomImage()]);
  }, []);

  useEffect(() => {
    if (spin) {
      setSpinning(true);
    } else {
      setSpinning(false);
    }
  }, [spin]);

  useEffect(() => {
    if (spinning) {
      tick();
    } else {
      clearInterval(isSpinning.current!);
      onStop(wheels);
    }

    return () => clearInterval(isSpinning.current!);
  }, [spinning]);

  const randomImage = () => images[Math.floor(Math.random() * images.length)];

  const spinWheels = () => {
    setWheels([randomImage(), randomImage(), randomImage()]);
  };

  const tick = () => {
    isSpinning.current = setInterval(spinWheels, 50);
  };

  return (
    <React.Fragment>
      <Wrapper>
        {wheels.map((wheel, id) => (
          <Wheel
            key={`${id}_${wheel}`}
            image={wheel}
          />
        ))}
      </Wrapper>
    </React.Fragment>
  );
};

export default Spinner;
