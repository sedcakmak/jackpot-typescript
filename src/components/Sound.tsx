import React from "react";

import fail from "../assets/audio/fail.wav";
import coin from "../assets/audio/coin.wav";
import slotmachine from "../assets/audio/slotmachine.wav";
import jingle from "../assets/audio/jingle.wav";
// import start from "../assets/audio/start.wav";

interface SoundProps {
  audio: "win" | "fail" | "coin" | "slotmachine" | "jingle";
}

const audios: Record<string, string> = { fail, coin, slotmachine, jingle };

const Sound: React.FC<SoundProps> = ({ audio }) => {
  if (!audio) return null;

  return (
    <audio
      autoPlay
      preload="auto"
      onCanPlayThrough={() => {}}
    >
      <source src={audios[audio]} />
    </audio>
  );
};

export default Sound;
